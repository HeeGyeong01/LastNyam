# ========== Stage 1: Gradle Dependency Cache ==========
FROM gradle:8.5-jdk21-alpine AS deps
WORKDIR /app
COPY settings.gradle ./foocketing-publisher/build.gradle ./
COPY gradle ./gradle
RUN --mount=type=cache,target=/root/.gradle \
    gradle dependencies --no-daemon

# ========== Stage 2: Build foocketing-publisher Module ==========
FROM gradle:8.5-jdk21-alpine AS build
WORKDIR /app

COPY --from=deps /root/.gradle /root/.gradle
COPY settings.gradle ./foocketing-publisher/build.gradle ./
COPY gradle ./gradle

# 전체 모듈 복사
COPY . .

# foocketing-publisher 모듈 빌드
RUN --mount=type=cache,target=/root/.gradle \
    gradle :foocketing-publisher:bootJar --no-daemon -x test --parallel

# ✅ 디버깅 + 안전한 레이어 추출
RUN echo "=== Checking JAR files ===" && \
    ls -lh /app/foocketing-publisher/build/libs/ && \
    JAR_FILE=$(ls /app/foocketing-publisher/build/libs/*.jar | head -n 1) && \
    echo "Found JAR: $JAR_FILE" && \
    echo "Testing layertools..." && \
    java -Djarmode=layertools -jar "$JAR_FILE" list && \
    echo "Extracting layers..." && \
    mkdir -p /tmp/extracted && \
    cd /tmp/extracted && \
    java -Djarmode=layertools -jar "$JAR_FILE" extract && \
    echo "Extraction complete!" && \
    ls -la /tmp/extracted/

# ========== Stage 3: Runtime ==========
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Layered JAR 복사
COPY --from=build --chown=appuser:appgroup /tmp/extracted/dependencies/ ./
COPY --from=build --chown=appuser:appgroup /tmp/extracted/spring-boot-loader/ ./
COPY --from=build --chown=appuser:appgroup /tmp/extracted/snapshot-dependencies/ ./
COPY --from=build --chown=appuser:appgroup /tmp/extracted/application/ ./

USER appuser

ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
