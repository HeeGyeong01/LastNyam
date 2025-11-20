# 백엔드 포팅 메뉴얼

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 요구사항](#시스템-요구사항)
3. [환경 설정](#환경-설정)
4. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
5. [빌드 환경 변수](#빌드-환경-변수)
6. [주요 설정 파일 목록](#주요-설정-파일-목록)
7. [Docker를 이용한 빌드 및 실행](#docker를-이용한-빌드-및-실행)
8. [배포 시 특이사항](#배포-시-특이사항)
9. [Kubernetes 배포](#kubernetes-배포)
10. [CI/CD 파이프라인](#cicd-파이프라인)
11. [외부 서비스 가입 및 사용 가이드](#외부-서비스-가입-및-사용-가이드)
12. [데이터베이스 덤프 파일](#데이터베이스-덤프-파일)
13. [시연 시나리오](#시연-시나리오)

---

## 프로젝트 개요

### 프로젝트 정보

- **프로젝트명**: LastNyam (lastnyam)
- **프레임워크**: Spring Boot 3.5.7
- **Java 버전**: 21
- **빌드 도구**: Gradle 8.5
- **아키텍처**: 멀티 모듈 마이크로서비스

### 서비스 모듈

- **customer**: 고객 서비스 (포트: 8083)
- **owner**: 사업자 서비스 (포트: 8080)
- **foocketing-publisher**: 메시지 발행 서비스
- **foocketing-subscriber**: 메시지 구독 서비스

### 공통 모듈

- **authentication**: 인증/인가 모듈
- **common**: 공통 유틸리티 모듈
- **core**: 핵심 모듈
- **database**: 데이터베이스 설정 모듈
- **messaging**: 메시징 설정 모듈
- **redis**: Redis 설정 모듈
- **s3**: AWS S3 설정 모듈

---

## 시스템 요구사항

### 필수 소프트웨어

- **Java**: JDK 21 이상
- **Gradle**: 8.5 이상 (또는 Gradle Wrapper 사용)
- **Docker**: 20.10 이상 (컨테이너 배포 시)
- **Docker Compose**: 2.0 이상 (선택사항)
- **PostgreSQL**: 12 이상
- **Redis**: 6.0 이상

### 개발 도구 (IDE)

- **IntelliJ IDEA**: 2025

### 웹 서버 / WAS

- **내장 서버**: Spring Boot 내장 Tomcat (기본)
  - **포트**:
    - Customer 서비스: 8083
    - Owner 서비스: 8080
    - Foocketing-Publisher: 8081
    - Foocketing-Subscriber: 8082
- **프로덕션 배포**: Kubernetes 환경에서 컨테이너로 실행

### 인프라 요구사항

- **메모리**: 최소 4GB RAM (로컬 개발), 8GB 이상 권장 (프로덕션)
- **디스크**: 최소 10GB 여유 공간
- **네트워크**: 인터넷 연결 (의존성 다운로드 및 외부 API 호출)

### 외부 서비스

- **AWS S3**: 파일 저장소
- **Kakao OAuth2**: 소셜 로그인
- **Kakao Pay**: 결제 서비스
- **Naver Clova OCR**: 사업자 등록증 OCR
- **Google Geocoding API**: 주소 변환
- **GMS API**: OpenAI 프록시

---

## 환경 설정

### 1. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 연결 정보를 설정해야 합니다.

```sql
-- 데이터베이스 생성 예시
CREATE DATABASE lastnyam;
CREATE USER lastnyam_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lastnyam TO lastnyam_user;
```

### 2. Redis 설정

Redis 서버를 실행하고 연결 정보를 설정해야 합니다.

```bash
# Redis 실행 (Docker 사용 시)
docker run -d -p 6379:6379 redis:latest
```

### 3. AWS S3 설정

AWS S3 버킷을 생성하고 IAM 사용자의 Access Key와 Secret Key를 발급받아야 합니다.

### 4. 애플리케이션 설정 파일

각 서비스 모듈은 다음 설정 파일들을 필요로 합니다:

#### Customer 서비스

- `application.yml`
- `application-authentication.yml`
- `application-database.yml`
- `application-redis.yml`
- `application-actuator.yml`
- `application-s3.yml`

#### Owner 서비스

- `application.yml`
- `application-authentication.yml`
- `application-database.yml`
- `application-redis.yml`
- `application-actuator.yml`
- `application-s3.yml`

#### Foocketing-Publisher 서비스

- `application.yml`
- `application-actuator.yml`
- `application-authentication.yml`
- `application-redis.yml`
- `application-messaging.yml`

#### Foocketing-Subscriber 서비스

- `application.yml`
- `application-actuator.yml`
- `application-database.yml`
- `application-redis.yml`
- `application-messaging.yml`
- `application-s3.yml`

### 5. 설정 파일 예시

#### application-database.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/lastnyam
    username: lastnyam_user
    password: your_password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: false
```

#### application-redis.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/lastnyam_db
    username: ${DB_USERNAME:lastnyam}
    password: ${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver

    # HikariCP Connection Pool 설정
    hikari:
      # Connection Pool 크기 설정
      maximum-pool-size: 20 # 최대 연결 수
      minimum-idle: 5 # 최소 유휴 연결 수

      # Connection 타임아웃 설정
      connection-timeout: 30000 # 연결 대기 시간 (30초)
      idle-timeout: 600000 # 유휴 연결 타임아웃 (10분)
      max-lifetime: 1800000 # 연결 최대 생명주기 (30분)

      # Connection 검증 설정
      connection-test-query: SELECT 1
      validation-timeout: 5000 # 검증 타임아웃 (5초)

      # Connection Pool 이름 (모니터링용)
      pool-name: LastNyamHikariCP

      # Connection 설정
      leak-detection-threshold: 60000 # 연결 누수 감지 (1분)

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
        jdbc:
          batch_size: 20 # 배치 처리 크기
          batch_versioned_data: true # 버전 관리된 데이터 배치 처리
        order_inserts: true # INSERT 순서 최적화
        order_updates: true # UPDATE 순서 최적화
    open-in-view: false

  sql:
    init:
      mode: never
```

#### application-s3.yml

```yaml
cloud:
  aws:
    s3:
      bucket: your-bucket-name
    region:
      static: ap-northeast-2
    credentials:
      access-key: your-access-key
      secret-key: your-secret-key
    presigned-url:
      expiration-minutes: 5
    upload:
      max-file-size: 10485760
      allowed-extensions:
        - jpg
        - jpeg
        - png
```

#### application-authentication.yml

```yaml
jwt:
  secret: your-jwt-secret-key-here-must-be-at-least-256-bits
  access-token-expiration: 3600000 # 1시간 (밀리초)
  refresh-token-expiration: 604800000 # 7일 (밀리초)
```

---

## 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd S13P31A101/BE
```

### 2. Gradle Wrapper 권한 설정 (Linux/Mac)

```bash
chmod +x gradlew
```

### 3. 프로젝트 빌드

```bash
# 전체 프로젝트 빌드
./gradlew build

# 특정 모듈만 빌드
./gradlew :customer:build
./gradlew :owner:build
```

### 4. 로컬 실행

#### Customer 서비스 실행

```bash
cd customer
../gradlew bootRun
# 또는
java -jar build/libs/customer-0.0.1-SNAPSHOT.jar
```

#### Owner 서비스 실행

```bash
cd owner
../gradlew bootRun
# 또는
java -jar build/libs/owner-0.0.1-SNAPSHOT.jar
```

### 5. 테스트 실행

```bash
# 전체 테스트 실행
./gradlew test

# 특정 모듈 테스트 실행
./gradlew :customer:test
./gradlew :owner:test
```

---

## 빌드 환경 변수

### 1. Gradle 빌드 환경 변수

#### GRADLE_OPTS

Gradle 빌드 시 사용되는 JVM 옵션입니다.

```bash
# Jenkins 파이프라인에서 사용
GRADLE_OPTS='-Dorg.gradle.daemon=false -Dorg.gradle.parallel=true'

# 로컬 개발 시 (선택사항)
export GRADLE_OPTS='-Xmx2048m -Dorg.gradle.daemon=true'
```

**설명**:

- `-Dorg.gradle.daemon=false`: Gradle 데몬 비활성화 (CI/CD 환경에서 권장)
- `-Dorg.gradle.parallel=true`: 병렬 빌드 활성화
- `-Xmx2048m`: 최대 힙 메모리 2GB 설정

### 2. Spring Boot 실행 환경 변수

#### SPRING_PROFILES_ACTIVE

활성화할 Spring 프로파일을 지정합니다.

```bash
# 프로덕션 환경
SPRING_PROFILES_ACTIVE=prod

# 개발 환경
SPRING_PROFILES_ACTIVE=dev

# 로컬 환경
SPRING_PROFILES_ACTIVE=local
```

#### JAVA_OPTS

애플리케이션 실행 시 JVM 옵션입니다.

```bash
# Docker 컨테이너 실행 시 (Dockerfile에 정의됨)
JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom"
```

**설명**:

- `-XX:+UseContainerSupport`: 컨테이너 환경에서 메모리 제한 인식
- `-XX:MaxRAMPercentage=75.0`: 사용 가능한 메모리의 75%를 힙으로 사용
- `-XX:+ExitOnOutOfMemoryError`: OOM 발생 시 즉시 종료
- `-Djava.security.egd=file:/dev/./urandom`: 랜덤 시드 생성 속도 향상

### 3. 데이터베이스 연결 환경 변수

설정 파일 대신 환경 변수로도 설정 가능합니다:

```bash
# PostgreSQL 연결 정보
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/lastnyam
SPRING_DATASOURCE_USERNAME=lastnyam_user
SPRING_DATASOURCE_PASSWORD=your_password

# Redis 연결 정보
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=
```

### 4. AWS S3 환경 변수

```bash
# AWS S3 설정
CLOUD_AWS_S3_BUCKET=your-bucket-name
CLOUD_AWS_REGION_STATIC=ap-northeast-2
CLOUD_AWS_CREDENTIALS_ACCESS_KEY=your-access-key
CLOUD_AWS_CREDENTIALS_SECRET_KEY=your-secret-key
```

### 5. JWT 인증 환경 변수

```bash
# JWT 설정
JWT_SECRET=your-jwt-secret-key-here-must-be-at-least-256-bits
JWT_ACCESS_TOKEN_EXPIRATION=3600000
JWT_REFRESH_TOKEN_EXPIRATION=604800000
```

### 6. 외부 API 환경 변수

```bash
# Kakao OAuth2
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# Kakao Pay
KAKAO_PAY_SECRET_KEY=your-kakao-pay-secret-key
KAKAO_PAY_CID=your-kakao-pay-cid

# Naver Clova OCR
CLOVA_API_BASE_URL=your-clova-api-url
CLOVA_SECRET_KEY=your-clova-secret-key

# Google Geocoding
GEOCODING_API_KEY=your-google-geocoding-api-key

# GMS API
GMS_URL=your-gms-api-url
GMS_API_KEY=your-gms-api-key
```

---

## 주요 설정 파일 목록

프로젝트에서 사용하는 주요 계정 및 프로퍼티를 정의한 파일 목록입니다.

### 1. 데이터베이스 연결 정보

#### application-database.yml

위치: 각 서비스 모듈의 `src/main/resources/application-database.yml`

**주요 설정 항목**:

- `spring.datasource.url`: PostgreSQL 데이터베이스 연결 URL
- `spring.datasource.username`: 데이터베이스 사용자명
- `spring.datasource.password`: 데이터베이스 비밀번호
- `spring.jpa.hibernate.ddl-auto`: DDL 자동 생성 설정 (validate 권장)

**주의사항**:

- 이 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- 실제 배포 시 Jenkins Credentials에서 설정 파일을 복사하여 사용합니다.

### 2. 인증/인가 설정

#### application-authentication.yml

위치: 각 서비스 모듈의 `src/main/resources/application-authentication.yml`

**주요 설정 항목**:

- `jwt.secret`: JWT 토큰 서명에 사용되는 비밀키 (최소 256비트)
- `jwt.access-token-expiration`: Access Token 만료 시간 (밀리초)
- `jwt.refresh-token-expiration`: Refresh Token 만료 시간 (밀리초)

### 3. Redis 설정

#### application-redis.yml

위치: 각 서비스 모듈의 `src/main/resources/application-redis.yml`

**주요 설정 항목**:

- `spring.data.redis.host`: Redis 서버 호스트
- `spring.data.redis.port`: Redis 서버 포트
- `spring.data.redis.password`: Redis 비밀번호 (선택사항)

### 4. AWS S3 설정

#### application-s3.yml

위치: 각 서비스 모듈의 `src/main/resources/application-s3.yml`

**주요 설정 항목**:

- `cloud.aws.s3.bucket`: S3 버킷 이름
- `cloud.aws.region.static`: AWS 리전
- `cloud.aws.credentials.access-key`: AWS Access Key
- `cloud.aws.credentials.secret-key`: AWS Secret Key

### 5. 서비스별 메인 설정 파일

#### Customer 서비스: application-customer.yml

위치: `BE/customer/src/main/resources/application-customer.yml`

**주요 설정 항목**:

- `server.port`: 서비스 포트 (8083)
- `spring.security.oauth2.client.registration.kakao`: Kakao OAuth2 설정
- `kakao.pay`: Kakao Pay 결제 설정

#### Owner 서비스: application-owner.yml

위치: `BE/owner/src/main/resources/application-owner.yml`

**주요 설정 항목**:

- `clova.api`: Naver Clova OCR API 설정
- `gms.url`, `gms.api-key`: GMS API 설정
- `geocoding.url`, `geocoding.api-key`: Google Geocoding API 설정

### 6. Actuator 설정

#### application-actuator.yml

위치: 각 서비스 모듈의 `src/main/resources/application-actuator.yml`

**주요 설정 항목**:

- `management.endpoints.web.exposure.include`: 노출할 Actuator 엔드포인트
- `management.endpoint.health.show-details`: 헬스 체크 상세 정보 표시 여부

### 7. 메시징 설정

#### application-messaging.yml

위치: `BE/foocketing-publisher`, `BE/foocketing-subscriber` 모듈

**주요 설정 항목**:

- 메시지 큐 연결 정보
- 메시지 발행/구독 설정

### 8. ERD 및 데이터베이스 스키마

데이터베이스 스키마는 JPA Entity 클래스를 통해 관리됩니다.

**주요 Entity 파일 위치**:

- `BE/database/src/main/java/com/lastnyam/database/entity/`

**주요 Entity**:

- `User`: 사용자 정보
- `Owner`: 사업자 정보
- 기타 도메인별 Entity 클래스들

**주의사항**:

- 프로덕션 환경에서는 `ddl-auto: validate`로 설정하여 자동 스키마 생성을 방지합니다.
- 스키마 변경은 마이그레이션 도구(예: Flyway, Liquibase)를 사용하는 것을 권장합니다.

---

## Docker를 이용한 빌드 및 실행

### 1. Docker 이미지 빌드

각 서비스 모듈의 Dockerfile을 사용하여 이미지를 빌드할 수 있습니다.

#### Customer 서비스 빌드

```bash
cd BE
docker build -t lastnyam/customer:latest -f customer/Dockerfile .
```

#### Owner 서비스 빌드

```bash
cd BE
docker build -t lastnyam/owner:latest -f owner/Dockerfile .
```

#### Foocketing-Publisher 빌드

```bash
cd BE
docker build -t lastnyam/foocketing-publisher:latest -f foocketing-publisher/Dockerfile .
```

#### Foocketing-Subscriber 빌드

```bash
cd BE
docker build -t lastnyam/foocketing-subscriber:latest -f foocketing-subscriber/Dockerfile .
```

### 2. Docker 컨테이너 실행

#### Customer 서비스 실행

```bash
docker run -d \
  --name customer-service \
  -p 8083:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  lastnyam/customer:latest
```

#### Owner 서비스 실행

```bash
docker run -d \
  --name owner-service \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  lastnyam/owner:latest
```

### 3. Docker Compose를 이용한 전체 스택 실행 (예시)

`docker-compose.yml` 파일을 생성하여 모든 서비스를 한 번에 실행할 수 있습니다.

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: lastnyam
      POSTGRES_USER: lastnyam_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  customer:
    build:
      context: .
      dockerfile: customer/Dockerfile
    ports:
      - "8083:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      - postgres
      - redis

  owner:
    build:
      context: .
      dockerfile: owner/Dockerfile
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

실행:

```bash
docker-compose up -d
```

---

## 배포 시 특이사항

### 1. 설정 파일 관리

#### 중요: 설정 파일은 Git에 커밋되지 않음

- 모든 `*.yml`, `*.properties` 파일은 `.gitignore`에 포함되어 있습니다.
- 실제 배포 시 Jenkins Credentials에서 설정 파일을 복사하여 사용합니다.
- 로컬 개발 시에는 각 모듈의 `src/main/resources/` 디렉토리에 설정 파일을 직접 생성해야 합니다.

### 2. 멀티 모듈 빌드 주의사항

#### Docker 빌드 시 컨텍스트

- Dockerfile은 프로젝트 루트(`BE/`)를 컨텍스트로 사용합니다.
- 모든 모듈이 빌드 컨텍스트에 포함되어야 하므로, Dockerfile 위치에 주의해야 합니다.

```dockerfile
# Dockerfile은 각 모듈 디렉토리에 있지만, 빌드 시 루트에서 실행
docker build -t image:tag -f customer/Dockerfile .
```

### 3. Spring Boot Layered JAR

#### 레이어 추출 과정

- Dockerfile에서 Spring Boot Layered JAR를 사용하여 이미지 크기를 최적화합니다.
- 레이어 추출 실패 시 빌드가 실패할 수 있으므로, JAR 파일이 정상적으로 생성되었는지 확인해야 합니다.

### 4. 포트 충돌 방지

#### 서비스별 포트

- Customer 서비스: 8083
- Owner 서비스: 8080
- 동일한 포트를 사용하는 서비스는 동시에 실행할 수 없습니다.
- Kubernetes 환경에서는 Service를 통해 포트를 관리합니다.

### 5. 데이터베이스 마이그레이션

#### 스키마 초기화

- 프로덕션 환경에서는 `ddl-auto: validate`를 사용합니다.
- 초기 데이터베이스 스키마는 수동으로 생성하거나 마이그레이션 도구를 사용해야 합니다.
- 데이터베이스 덤프 파일을 사용하여 초기 데이터를 로드할 수 있습니다.

### 6. 외부 서비스 의존성

#### 필수 외부 서비스

배포 전 다음 서비스들이 정상적으로 동작하는지 확인해야 합니다:

- PostgreSQL 데이터베이스 서버
- Redis 서버
- AWS S3 버킷 및 IAM 권한
- Kakao OAuth2 앱 등록 및 리다이렉트 URI 설정
- Kakao Pay 가맹점 등록
- Naver Clova OCR API 키 발급
- Google Geocoding API 키 발급
- GMS API 접근 권한

### 7. 환경 변수 우선순위

Spring Boot는 다음 순서로 설정을 로드합니다:

1. 환경 변수
2. `application-{profile}.yml` 파일
3. `application.yml` 파일

환경 변수가 설정 파일보다 우선순위가 높으므로, 환경 변수로 오버라이드할 수 있습니다.

### 8. Kubernetes 배포 시 주의사항

#### ConfigMap 및 Secret

- 민감한 정보(비밀번호, API 키 등)는 Secret으로 관리합니다.
- 일반 설정은 ConfigMap으로 관리합니다.
- 설정 파일 변경 시 ConfigMap/Secret을 업데이트하고 Pod를 재시작해야 합니다.

#### 리소스 제한

- 각 서비스는 적절한 리소스 제한을 설정해야 합니다.
- 메모리 부족으로 인한 OOM Kill을 방지하기 위해 `-XX:MaxRAMPercentage` 옵션을 사용합니다.

### 9. 로그 관리

#### 로그 출력

- 애플리케이션 로그는 표준 출력(stdout)으로 출력됩니다.
- Kubernetes 환경에서는 `kubectl logs` 명령어로 로그를 확인할 수 있습니다.
- 프로덕션 환경에서는 중앙화된 로그 수집 시스템(예: ELK Stack) 사용을 권장합니다.

### 10. 헬스 체크

#### Actuator 엔드포인트

- `/actuator/health` 엔드포인트를 통해 서비스 상태를 확인할 수 있습니다.
- Kubernetes Liveness/Readiness Probe 설정 시 이 엔드포인트를 사용할 수 있습니다.

---

## Kubernetes 배포

### 1. 사전 준비

- Kubernetes 클러스터 설정 완료
- kubectl 설치 및 클러스터 연결 확인
- Docker Registry 접근 권한 확인

### 2. Manifest 파일 구조

프로젝트의 `K8s` 브랜치에 다음 구조로 배포 매니페스트가 있습니다:

```
app/
├── customer/
│   └── deployment.yml
├── owner/
│   └── deployment.yml
├── subscriber/
│   └── deployment.yml
└── foocketing-publisher/
    └── deployment.yml
```

### 3. 배포 매니페스트 예시

#### Customer Deployment 예시

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: customer-service
  namespace: lastnyam
spec:
  replicas: 2
  selector:
    matchLabels:
      app: customer-service
  template:
    metadata:
      labels:
        app: customer-service
    spec:
      containers:
        - name: customer
          image: 941kjw/customer:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: customer-service
  namespace: lastnyam
spec:
  selector:
    app: customer-service
  ports:
    - port: 80
      targetPort: 8080
  type: LoadBalancer
```

### 4. 배포 명령어

```bash
# 네임스페이스 생성
kubectl create namespace lastnyam

# Customer 서비스 배포
kubectl apply -f app/customer/deployment.yml

# Owner 서비스 배포
kubectl apply -f app/owner/deployment.yml

# 배포 상태 확인
kubectl get pods -n lastnyam
kubectl get services -n lastnyam
```

### 5. ConfigMap 및 Secret 설정

민감한 정보는 ConfigMap과 Secret을 사용하여 관리합니다.

```bash
# Secret 생성 예시
kubectl create secret generic db-secret \
  --from-literal=username=lastnyam_user \
  --from-literal=password=your_password \
  -n lastnyam

# ConfigMap 생성 예시
kubectl create configmap app-config \
  --from-file=application.yml \
  -n lastnyam
```

---

## CI/CD 파이프라인

### 1. Jenkins 파이프라인 개요

프로젝트는 Jenkins를 사용한 CI/CD 파이프라인을 구축하고 있습니다.

### 2. 파이프라인 트리거

- **브랜치**: `BE/master` 브랜치에 푸시 시 자동 실행
- **수동 실행**: Jenkins에서 수동으로 파이프라인 실행 가능

### 3. 빌드 전략

파이프라인은 변경된 모듈만 선택적으로 빌드합니다:

- **Customer 서비스**: `BE/customer/` 또는 공통 모듈 변경 시 빌드
- **Owner 서비스**: `BE/owner/` 또는 공통 모듈 변경 시 빌드
- **Foocketing-Subscriber**: `BE/foocketing-subscriber/` 또는 공통 모듈, messaging 모듈 변경 시 빌드
- **Foocketing-Publisher**: `BE/foocketing-publisher/` 또는 공통 모듈, messaging 모듈 변경 시 빌드

### 4. 파이프라인 단계

1. **브랜치 및 변경사항 감지**: Git diff를 통해 변경된 모듈 확인
2. **빌드 준비**: Gradle Wrapper 권한 설정
3. **설정 파일 복사**: Jenkins Credentials에서 설정 파일 복사
4. **빌드 및 이미지 생성**: Docker 이미지 빌드 및 레지스트리 푸시
5. **서비스 배포**: Kubernetes 매니페스트 업데이트 및 배포

### 5. Jenkins Credentials 설정

다음 Credentials를 Jenkins에 등록해야 합니다:

- **customer**: Customer 서비스 설정 파일
- **owner**: Owner 서비스 설정 파일
- **actuator**: Actuator 설정 파일
- **authentication**: 인증 설정 파일
- **database**: 데이터베이스 설정 파일
- **messaging**: 메시징 설정 파일
- **redis**: Redis 설정 파일
- **s3**: S3 설정 파일
- **subscriber**: Subscriber 설정 파일
- **publisher**: Publisher 설정 파일
- **docker-token**: Docker Hub 인증 토큰
- **de12f27e-dd2d-4317-8046-a9ad86c3d720**: Git 인증 토큰

### 6. Docker Registry 설정

- **Registry**: `941kjw` (Docker Hub 사용자명)
- **Tag**: Git commit SHA의 짧은 버전 사용

### 7. 강제 빌드 옵션

Jenkins 파이프라인 파라미터를 통해 특정 모듈을 강제로 빌드할 수 있습니다:

- `FORCE_BUILD_ALL`: 모든 모듈 강제 빌드
- `FORCE_BUILD_CUSTOMER`: Customer 서비스 강제 빌드
- `FORCE_BUILD_OWNER`: Owner 서비스 강제 빌드
- `FORCE_BUILD_FS`: Foocketing-Subscriber 강제 빌드
- `FORCE_BUILD_FP`: Foocketing-Publisher 강제 빌드

---

## 외부 서비스 가입 및 사용 가이드

### 1. AWS S3

#### 가입 및 버킷 생성

1. AWS 계정 생성: https://aws.amazon.com/
2. S3 서비스로 이동
3. 버킷 생성 (리전: ap-northeast-2 권장)
4. IAM 사용자 생성 및 Access Key/Secret Key 발급
5. S3 버킷 접근 권한 부여

#### 설정 정보

- **버킷 이름**: 프로젝트에서 사용할 버킷 이름
- **리전**: ap-northeast-2 (서울)
- **Access Key**: IAM 사용자의 Access Key
- **Secret Key**: IAM 사용자의 Secret Key

#### 주의사항

- Access Key와 Secret Key는 안전하게 보관해야 합니다.
- 버킷 정책에서 필요한 권한만 부여하는 것을 권장합니다.

### 2. Kakao OAuth2

#### 개발자 등록 및 앱 생성

1. Kakao Developers 가입: https://developers.kakao.com/
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 키 발급 (REST API 키, Client ID, Client Secret)

#### 플랫폼 설정

1. 플랫폼 > Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:8083` (개발), `https://lastnyam.co.kr` (프로덕션)
2. Redirect URI 등록
   - 개발: `http://localhost:8083/api/login/oauth2/code/kakao`
   - 프로덕션: `https://lastnyam.co.kr/api/login/oauth2/code/kakao`

#### 동의 항목 설정

필요한 동의 항목:

- 닉네임 (필수)
- 프로필 사진 (선택)
- 카카오계정(이메일) (선택)

#### 설정 정보

- **Client ID**: REST API 키 또는 Client ID
- **Client Secret**: Client Secret
- **Redirect URI**: 위에서 등록한 URI

### 3. Kakao Pay

#### 가맹점 등록

1. Kakao Pay 비즈니스 가입: https://developers.kakao.com/pay
2. 가맹점 코드(CID) 발급
3. Secret Key 발급

#### 테스트 환경

- **CID**: `TC0ONETIME` (테스트용)
- **Secret Key**: 개발자 센터에서 발급받은 Secret Key

#### 프로덕션 환경

- 실제 운영 시 발급받은 CID와 Secret Key 사용

#### 설정 정보

- **Secret Key**: Kakao Pay Secret Key
- **CID**: 가맹점 코드
- **Base URL**: `https://open-api.kakaopay.com`
- **Approval URL**: 결제 성공 시 리다이렉트 URL
- **Cancel URL**: 결제 취소 시 리다이렉트 URL
- **Fail URL**: 결제 실패 시 리다이렉트 URL

### 4. Naver Clova OCR

#### 서비스 신청

1. Naver Cloud Platform 가입: https://www.ncloud.com/
2. AI·NAVER API > Clova OCR 서비스 신청
3. API 인증키 발급

#### 설정 정보

- **Base URL**: Clova OCR API 엔드포인트 URL
- **Secret Key**: API 인증키

#### 사용 목적

- 사업자 등록증 OCR 인식

### 5. Google Geocoding API

#### API 키 발급

1. Google Cloud Platform 가입: https://cloud.google.com/
2. 프로젝트 생성
3. Geocoding API 활성화
4. API 키 생성 및 제한 설정

#### 설정 정보

- **API Key**: 발급받은 Google API 키
- **URL**: `https://maps.googleapis.com/maps/api/geocode/json`

#### 사용 목적

- 주소를 좌표(위도, 경도)로 변환

### 6. GMS API (SSAFY 내부)

#### 접근 방법

- SSAFY 내부 GMS 서비스를 통해 OpenAI API를 프록시합니다.
- 프로젝트별로 API 키가 발급됩니다.

#### 설정 정보

- **URL**: `https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions`
- **API Key**: 프로젝트별로 발급된 API 키

#### 사용 목적

- AI 기반 가게 리포트 생성

---

## 데이터베이스 덤프 파일

### 1. 덤프 파일 위치

데이터베이스 덤프 파일은 프로젝트 저장소의 별도 위치에 보관되거나, 별도의 저장소에 관리됩니다.

**권장 위치**:

- 프로젝트 루트의 `database/` 디렉토리
- 또는 별도의 데이터베이스 저장소

### 2. 덤프 파일 생성

#### PostgreSQL 덤프 생성

```bash
# 전체 데이터베이스 덤프
pg_dump -U lastnyam_user -d lastnyam -F c -f lastnyam_backup.dump

# SQL 형식으로 덤프
pg_dump -U lastnyam_user -d lastnyam -f lastnyam_backup.sql

# 스키마만 덤프
pg_dump -U lastnyam_user -d lastnyam --schema-only -f lastnyam_schema.sql

# 데이터만 덤프
pg_dump -U lastnyam_user -d lastnyam --data-only -f lastnyam_data.sql
```

### 3. 덤프 파일 복원

#### PostgreSQL 덤프 복원

```bash
# Custom 형식 덤프 복원
pg_restore -U lastnyam_user -d lastnyam -c lastnyam_backup.dump

# SQL 형식 덤프 복원
psql -U lastnyam_user -d lastnyam -f lastnyam_backup.sql
```

### 4. 초기 데이터 로드

#### 개발 환경 설정 시

1. 데이터베이스 생성
2. 덤프 파일 복원
3. 애플리케이션 실행

```bash
# 데이터베이스 생성
createdb -U postgres lastnyam

# 덤프 복원
pg_restore -U postgres -d lastnyam lastnyam_backup.dump

# 또는 SQL 파일 실행
psql -U postgres -d lastnyam -f lastnyam_backup.sql
```

### 5. 테스트 계정 정보

시연 및 테스트를 위한 계정 정보:

#### Owner 계정 (싸피)

- **이메일**: `aaa@aaa.aaa`
- **비밀번호**: `aaaa1111`

#### Owner 계정 (리브팜 방배)

- **이메일**: `liveFarm@aaa.aaa`
- **비밀번호**: `aaaa1111`

**주의사항**:

- 프로덕션 환경에서는 반드시 비밀번호를 변경해야 합니다.
- 테스트 계정은 개발 환경에서만 사용해야 합니다.

---

## 시연 시나리오

### 시나리오 1: 푸켓팅

#### 사전 준비

- Owner 계정 로그인 (싸피): `aaa@aaa.aaa` / `aaaa1111`

#### 1. Owner - 푸켓팅 등록

1. Owner 대시보드 접속
2. 푸켓팅 메뉴 선택
3. 푸켓팅 등록 클릭
4. 상품명 입력: **"칸쵸"** (검색 시 다른 상품과 구분하기 위해 특이한 이름 사용)
5. 수량 설정: **3개**
6. 등록 완료

#### 2. Customer - 푸켓팅 검색 및 참여

1. Customer 앱 접속
2. 검색창에 **"칸쵸"** 입력
3. 검색 결과에서 해당 푸켓팅 선택
4. **푸켓팅 참여** 버튼 클릭
5. **실패 시나리오**: 참여 버튼을 살짝 늦게 클릭하여 실패 상황 연출
6. 다시 검색창에 **"10층 도시락"** 입력
7. 검색 결과에서 해당 푸켓팅 선택
8. **푸켓팅 참여** 버튼 클릭
9. **성공 시나리오**: 정상적으로 참여 완료

#### 3. Customer - 주문내역 확인

1. 주문내역 메뉴 클릭
2. 성공한 푸켓팅 항목 선택
3. **QR 코드 확인** (QR 코드가 활성화되어 있는지 확인)

#### 4. Owner - QR 스캔 및 수령확인

1. Owner 대시보드 접속
2. 주문 관리 메뉴 선택
3. QR 스캔 기능 선택
4. Customer의 QR 코드 스캔
5. **수령확인 처리** 완료

---

### 시나리오 2: 마감세일

#### 사전 준비

- Owner 계정 로그인 (리브팜 방배): `liveFarm@aaa.aaa` / `aaaa1111`

#### 1. Customer - 상품 검색 및 장바구니 담기

1. Customer 앱 Home 화면 접속
2. **"회/초밥"** 카테고리 클릭
   - 시연 멘트: "약간 모자란데 뭔가 더 먹어야겠어요~"
3. **"샐러드/포케로"** 탭으로 전환
   - 시연 멘트: "다이어트중이라 샐러드 먹겠습니다"
4. 지도를 **방배역 근처**로 이동
5. 필터를 **가격순**으로 변경
6. 가장 위에 있는 상품 (가장 싼 상품) 클릭
7. 상품 상세 페이지에서 **"담기"** 버튼 클릭

#### 2. Customer - 장바구니 및 결제

1. 장바구니로 이동
2. 수량 변경 (필요 시)
3. **결제** 버튼 클릭
   - **주의**: 실제 결제는 본인 폰으로 진행
4. 결제 완료 후 **"주문완료! 주문내역보기"** 클릭

#### 3. Customer - 주문 상태 확인 (초기)

1. 주문내역에서 방금 주문한 항목 확인
2. **QR 코드가 비활성 상태**인지 확인
3. **뱃지가 "승인대기" 상태**인지 확인

#### 4. Owner - 주문 상태 변경

1. Owner 대시보드 접속
2. 주문 관리 메뉴에서 방금 들어온 주문 확인
3. 주문 상태를 **"픽업대기"** 상태로 변경

#### 5. Customer - 주문 상태 재확인

1. Customer 앱에서 **새로고침**
2. 주문내역에서 해당 주문 확인
3. **QR 코드가 활성화**되었는지 확인
4. **뱃지가 "픽업대기" 상태**로 변경되었는지 확인

#### 6. Owner - QR 스캔 및 수령완료

1. Owner 대시보드에서 QR 스캔 기능 선택
2. Customer의 QR 코드 스캔
3. **수령 완료 처리**

#### 7. Owner - 가게 리포트 확인

1. Owner 대시보드에서 **가게 리포트** 메뉴 선택
2. AI가 제공하는 **조언 내용** 확인
3. 리포트의 각 섹션을 순서대로 보여주기
4. 시연 종료

---

### 시연 시 주의사항

1. **계정 정보**

   - Owner 계정은 시나리오별로 다른 계정을 사용합니다.
   - 테스트 계정 정보는 안전하게 관리해야 합니다.

2. **타이밍**

   - 푸켓팅 실패 시나리오에서는 의도적으로 늦게 클릭하여 실패 상황을 연출합니다.
   - 주문 상태 변경 후 Customer 앱에서 새로고침이 필요합니다.

3. **QR 코드**

   - QR 코드는 주문 상태에 따라 활성/비활성 상태가 변경됩니다.
   - 승인대기 상태에서는 QR 코드가 비활성화되어 있습니다.

4. **결제**
   - 실제 결제는 본인 폰으로 진행해야 합니다.
   - 테스트 환경에서는 Kakao Pay 테스트 CID를 사용합니다.

---
