pipeline {
  agent any
  
  parameters {
    booleanParam(
      name: 'FORCE_BUILD_ALL', 
      defaultValue: false, 
      description: '🔥 모든 모듈 강제 빌드 (변경사항 무시)'
    )
    
    // ========== BE 모듈별 강제 빌드 ==========
    booleanParam(
      name: 'FORCE_BUILD_CUSTOMER',
      defaultValue: false,
      description: '👤 Customer 서비스 강제 빌드'
    )
    booleanParam(
      name: 'FORCE_BUILD_OWNER',
      defaultValue: false,
      description: '🏪 Owner 서비스 강제 빌드'
    )
    booleanParam(
      name: 'FORCE_BUILD_FS',
      defaultValue: false,
      description: '📥 Foocketing-Subscriber 강제 빌드'
    )
    booleanParam(
      name: 'FORCE_BUILD_FP',
      defaultValue: false,
      description: '📤 Foocketing-Publisher 강제 빌드'
    )
    
    // ========== FE 모듈별 강제 빌드 ==========
    booleanParam(
      name: 'FORCE_BUILD_FE_OWNER',
      defaultValue: false,
      description: '🏪 FE Owner 강제 빌드'
    )
    booleanParam(
      name: 'FORCE_BUILD_FE_CUSTOMER',
      defaultValue: false,
      description: '👤 FE Customer 강제 빌드'
    )
  }


  environment {
    REGISTRY = '941kjw'
    TAG = "latest"
    GRADLE_OPTS = '-Dorg.gradle.daemon=false -Dorg.gradle.parallel=true'
    PUB_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
  }


  stages {
    stage('브랜치 및 변경사항 감지') {
      steps {
        script {
          def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH
          echo "🌿 현재 브랜치: ${branchName}"
          
          def changes = sh(
            script: '''
              if git rev-parse HEAD~1 >/dev/null 2>&1; then
                git diff --name-only HEAD~1 HEAD
              else
                git diff-tree --no-commit-id --name-only -r HEAD
              fi
            ''',
            returnStdout: true
          ).trim()
          
          echo "=" * 50
          echo "📋 Git diff 결과:"
          echo changes
          echo "=" * 50
          
          if (branchName == 'BE/master' || branchName == 'origin/BE/master') {
            def commonModules = ['core', 'common', 'authentication', 'database']
            def isCommonChanged = commonModules.any { changes.contains("BE/${it}/") }
            def isMessagingChanged = changes.contains('BE/messaging/')
            
            env.BUILD_CUSTOMER = (
              params.FORCE_BUILD_ALL || 
              params.FORCE_BUILD_CUSTOMER || 
              changes.contains('BE/customer/') || 
              isCommonChanged
            ).toString()
            
            env.BUILD_OWNER = (
              params.FORCE_BUILD_ALL || 
              params.FORCE_BUILD_OWNER || 
              changes.contains('BE/owner/') || 
              isCommonChanged
            ).toString()
            
            env.BUILD_FS = (
              params.FORCE_BUILD_ALL || 
              params.FORCE_BUILD_FS || 
              changes.contains('BE/foocketing-subscriber/') || 
              isCommonChanged || 
              isMessagingChanged
            ).toString()
            
            env.BUILD_FP = (
              params.FORCE_BUILD_ALL || 
              params.FORCE_BUILD_FP || 
              changes.contains('BE/foocketing-publisher/') || 
              isCommonChanged || 
              isMessagingChanged
            ).toString()
            
            env.IS_BE = 'true'
            env.IS_FE = 'false'
            
            echo """
┌─────────────────────────────────────────┐
│      BE 빌드 계획                        │
├─────────────────────────────────────────┤
│ 👤 Customer              : ${env.BUILD_CUSTOMER == 'true' ? '✅ 빌드' : '⏭️  건너뜀'} ${params.FORCE_BUILD_CUSTOMER ? '(강제)' : '      '} │
│ 🏪 Owner                 : ${env.BUILD_OWNER == 'true' ? '✅ 빌드' : '⏭️  건너뜀'} ${params.FORCE_BUILD_OWNER ? '(강제)' : '      '} │
│ 📥 Foocketing-Sub        : ${env.BUILD_FS == 'true' ? '✅ 빌드' : '⏭️  건너뜀'} ${params.FORCE_BUILD_FS ? '(강제)' : '      '} │
│ 📤 Foocketing-Pub        : ${env.BUILD_FP == 'true' ? '✅ 빌드' : '⏭️  건너뜀'} ${params.FORCE_BUILD_FP ? '(강제)' : '      '} │
└─────────────────────────────────────────┘
            """
          }
          else if (branchName == 'FE/master' || branchName == 'origin/FE/master') {
            def isSharedChanged = changes.contains('FE/shared/')
            def isOwnerChanged = changes.contains('FE/owner/')
            def isCustomerChanged = changes.contains('FE/customer/')
            
            env.BUILD_FE_OWNER = (
              params.FORCE_BUILD_ALL || 
              params.FORCE_BUILD_FE_OWNER || 
              isOwnerChanged || 
              isSharedChanged
            ).toString()
            
            env.BUILD_FE_CUSTOMER = (
              params.FORCE_BUILD_ALL || 
              params.FORCE_BUILD_FE_CUSTOMER || 
              isCustomerChanged || 
              isSharedChanged
            ).toString()
            
            env.IS_BE = 'false'
            env.IS_FE = 'true'
            
            echo """
┌─────────────────────────────────────────┐
│      FE 빌드 계획                        │
├─────────────────────────────────────────┤
│ 🏪 Owner                 : ${env.BUILD_FE_OWNER == 'true' ? '✅ 빌드' : '⏭️  건너뜀'} ${params.FORCE_BUILD_FE_OWNER ? '(강제)' : '      '} │
│ 👤 Customer              : ${env.BUILD_FE_CUSTOMER == 'true' ? '✅ 빌드' : '⏭️  건너뜀'} ${params.FORCE_BUILD_FE_CUSTOMER ? '(강제)' : '      '} │
├─────────────────────────────────────────┤
│ Shared 변경: ${isSharedChanged ? '예' : '아니오'}                      │
└─────────────────────────────────────────┘
            """
          }
          else {
            echo "⏭️ 건너뜀: ${branchName} 브랜치는 설정되지 않았습니다"
            env.IS_BE = 'false'
            env.IS_FE = 'false'
          }
        }
      }
    }


    // ==================== BE 빌드/배포 ====================
    stage('BE - 빌드 준비') {
      when { expression { return env.IS_BE == 'true' } }
      steps {
        dir('BE') {
          echo '🔧 gradlew 실행 권한 설정 중...'
          sh 'chmod +x gradlew'
        }
      }
    }


    stage('BE - 설정 파일 복사') {
      when { expression { return env.IS_BE == 'true' } }
      steps {
        script {

          sh "chown -R \$(id -u):\$(id -g) \${WORKSPACE}/BE"

          withCredentials([
            file(credentialsId: 'customer', variable: 'CUSTOMER_APP_YML'),
            file(credentialsId: 'owner', variable: 'OWNER_APP_YML'),
            file(credentialsId: 'actuator', variable: 'ACTUATOR_YML'),
            file(credentialsId: 'authentication', variable: 'AUTHENTICATION_YML'),
            file(credentialsId: 'database', variable: 'DATABASE_YML'),
            file(credentialsId: 'messaging', variable: 'MESSAGING_YML'),
            file(credentialsId: 'redis', variable: 'REDIS_YML'),
            file(credentialsId: 's3', variable: 'S3_YML'),
            file(credentialsId: 'subscriber', variable: 'SUBSCRIBER_YML'),
            file(credentialsId: 'publisher', variable: 'PUBLISHER_YML')
          ]) {
            sh """
              set -e
              
              # Customer
              if [ "${env.BUILD_CUSTOMER}" = "true" ]; then
                TARGET_DIR="${WORKSPACE}/BE/customer/src/main/resources"
                mkdir -p \${TARGET_DIR}
                chmod +w \${TARGET_DIR}
                chmod +w \${TARGET_DIR}/*.yml 2>/dev/null || true
                cp -v \$CUSTOMER_APP_YML \${TARGET_DIR}/application.yml
                cp -v \$AUTHENTICATION_YML \${TARGET_DIR}/application-authentication.yml
                cp -v \$ACTUATOR_YML \${TARGET_DIR}/application-actuator.yml
                cp -v \$DATABASE_YML \${TARGET_DIR}/application-database.yml
                cp -v \$REDIS_YML \${TARGET_DIR}/application-redis.yml
                cp -v \$S3_YML \${TARGET_DIR}/application-s3.yml
                echo "✅ Customer 설정 파일 복사 완료"
              fi
              
              # Owner
              if [ "${env.BUILD_OWNER}" = "true" ]; then
                TARGET_DIR="${WORKSPACE}/BE/owner/src/main/resources"
                mkdir -p \${TARGET_DIR}
                chmod +w \${TARGET_DIR}
                chmod +w \${TARGET_DIR}/*.yml 2>/dev/null || true
                cp -v \$OWNER_APP_YML \${TARGET_DIR}/application.yml
                cp -v \$AUTHENTICATION_YML \${TARGET_DIR}/application-authentication.yml
                cp -v \$ACTUATOR_YML \${TARGET_DIR}/application-actuator.yml
                cp -v \$DATABASE_YML \${TARGET_DIR}/application-database.yml
                cp -v \$REDIS_YML \${TARGET_DIR}/application-redis.yml
                cp -v \$S3_YML \${TARGET_DIR}/application-s3.yml
                echo "✅ Owner 설정 파일 복사 완료"
              fi
              
              # Foocketing-Subscriber
              if [ "${env.BUILD_FS}" = "true" ]; then
                TARGET_DIR="${WORKSPACE}/BE/foocketing-subscriber/src/main/resources"
                mkdir -p \${TARGET_DIR}
                chmod +w \${TARGET_DIR}
                chmod +w \${TARGET_DIR}/*.yml 2>/dev/null || true
                cp -v \$SUBSCRIBER_YML \${TARGET_DIR}/application.yml
                cp -v \$ACTUATOR_YML \${TARGET_DIR}/application-actuator.yml
                cp -v \$DATABASE_YML \${TARGET_DIR}/application-database.yml
                cp -v \$REDIS_YML \${TARGET_DIR}/application-redis.yml
                cp -v \$MESSAGING_YML \${TARGET_DIR}/application-messaging.yml
                echo "✅ Foocketing-Subscriber 설정 파일 복사 완료"
              fi
              
              # Foocketing-Publisher
              if [ "${env.BUILD_FP}" = "true" ]; then
                TARGET_DIR="${WORKSPACE}/BE/foocketing-publisher/src/main/resources"
                mkdir -p \${TARGET_DIR}
                chmod +w \${TARGET_DIR}
                chmod +w \${TARGET_DIR}/*.yml 2>/dev/null || true
                cp -v \$PUBLISHER_YML \${TARGET_DIR}/application.yml
                cp -v \$ACTUATOR_YML \${TARGET_DIR}/application-actuator.yml
                cp -v \$AUTHENTICATION_YML \${TARGET_DIR}/application-authentication.yml
                cp -v \$REDIS_YML \${TARGET_DIR}/application-redis.yml
                cp -v \$MESSAGING_YML \${TARGET_DIR}/application-messaging.yml
                echo "✅ Foocketing-Publisher 설정 파일 복사 완료"
              fi
              
              echo "✅ 모든 설정 파일 준비 완료!"
            """
          }
        }
      }
    }
    
    stage('BE - 빌드 및 이미지 생성') {
      when { expression { return env.IS_BE == 'true' } }
      parallel {
        
        stage('Customer 빌드') {
          when { expression { return env.BUILD_CUSTOMER == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Customer 서비스 빌드 중...'
                  sh './gradlew :customer:clean :customer:bootJar --parallel --build-cache'
                  sh """
                    docker pull ${REGISTRY}/customer:latest || true
                    docker build \
                      --cache-from ${REGISTRY}/customer:latest \
                      -t ${REGISTRY}/customer:${TAG} \
                      -f customer/Dockerfile .
                  """
                  env.BUILD_CUSTOMER_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ Customer 빌드 실패: ${e.message}"
                env.BUILD_CUSTOMER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Owner 빌드') {
          when { expression { return env.BUILD_OWNER == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Owner 서비스 빌드 중...'
                  sh './gradlew :owner:clean :owner:bootJar --parallel --build-cache'
                  sh """
                    docker pull ${REGISTRY}/owner:latest || true
                    docker build \
                      --cache-from ${REGISTRY}/owner:latest \
                      -t ${REGISTRY}/owner:${TAG} \
                      -f owner/Dockerfile .
                  """
                  env.BUILD_OWNER_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ Owner 빌드 실패: ${e.message}"
                env.BUILD_OWNER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Foocketing-Subscriber 빌드') {
          when { expression { return env.BUILD_FS == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Foocketing-Subscriber 빌드 중...'
                  sh './gradlew :foocketing-subscriber:clean :foocketing-subscriber:bootJar --parallel --build-cache'
                  sh """
                    docker pull ${REGISTRY}/foocketing-subscriber:latest || true
                    docker build \
                      --cache-from ${REGISTRY}/foocketing-subscriber:latest \
                      -t ${REGISTRY}/foocketing-subscriber:${TAG} \
                      -f foocketing-subscriber/Dockerfile .
                  """
                  env.BUILD_FS_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ Foocketing-Subscriber 빌드 실패: ${e.message}"
                env.BUILD_FS_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Foocketing-Publisher 빌드') {
          when { expression { return env.BUILD_FP == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Foocketing-Publisher 빌드 중...'
                  sh './gradlew :foocketing-publisher:clean :foocketing-publisher:bootJar --parallel --build-cache'
                  withCredentials([usernamePassword(credentialsId: 'docker-token', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                      sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin 
                        docker build \
                          -t ${REGISTRY}/foocketing-publisher:${PUB_TAG} \
                          -f foocketing-publisher/Dockerfile .

                        echo "🚀 Docker Hub로 이미지 푸시 중..."
                        docker push ${REGISTRY}/foocketing-publisher:${PUB_TAG}
                      """
                      
                  }
                  env.BUILD_FP_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ Foocketing-Publisher 빌드 실패: ${e.message}"
                env.BUILD_FP_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
      }
    }
    
    stage('BE - 서비스 배포') {
      when { expression { return env.IS_BE == 'true' } }
      parallel {
        
        stage('Customer 배포') {
          when { expression { return env.BUILD_CUSTOMER == 'true' && env.BUILD_CUSTOMER_SUCCESS == 'true' } }
          steps {
            script {
              try {
                echo '🚀 Customer 서비스 배포 중...'
                sh """
                  set -e
                  cd /var/scripts
                  docker compose -f customer.yml up -d
                  
                  echo "⏳ 서비스 시작 대기 중..."
                  for i in {1..60}; do
                    if docker compose ps -f customer.yml customer | grep -q "Up"; then
                      echo "✅ Customer 서비스 배포 완료"
                      exit 0
                    fi
                    sleep 1
                  done
                  echo "❌ 배포 타임아웃"
                  exit 1
                """
                env.DEPLOY_CUSTOMER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ Customer 배포 실패: ${e.message}"
                env.DEPLOY_CUSTOMER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Owner 배포') {
          when { expression { return env.BUILD_OWNER == 'true' && env.BUILD_OWNER_SUCCESS == 'true' } }
          steps {
            script {
              try {
                echo '🚀 Owner 서비스 배포 중...'
                sh """
                  set -e
                  cd /var/scripts
                  docker compose -f owner.yml up -d
                  
                  echo "⏳ 서비스 시작 대기 중..."
                  for i in {1..60}; do
                    if docker compose -f owner.yml ps owner | grep -q "Up"; then
                      echo "✅ Owner 서비스 배포 완료"
                      exit 0
                    fi
                    sleep 1
                  done
                  echo "❌ 배포 타임아웃"
                  exit 1
                """
                env.DEPLOY_OWNER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ Owner 배포 실패: ${e.message}"
                env.DEPLOY_OWNER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Foocketing-Subscriber 배포') {
          when { expression { return env.BUILD_FS == 'true' && env.BUILD_FS_SUCCESS == 'true' } }
          steps {
            script {
              try {
                echo '🚀 Foocketing-Subscriber 배포 중...'
                sh """
                  set -e
                  cd /var/scripts
                  docker compose -f foocketing-subscriber.yml up -d
                  
                  echo "⏳ 서비스 시작 대기 중..."
                  for i in {1..60}; do
                    if docker compose -f foocketing-subscriber.yml ps subscriber | grep -q "Up"; then
                      echo "✅ Foocketing-Subscriber 배포 완료"
                      exit 0
                    fi
                    sleep 1
                  done
                  echo "❌ 배포 타임아웃"
                  exit 1
                """
                env.DEPLOY_FS_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ Foocketing-Subscriber 배포 실패: ${e.message}"
                env.DEPLOY_FS_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Foocketing-Publisher 배포') {
          when { expression { return env.BUILD_FP == 'true' && env.BUILD_FP_SUCCESS == 'true' } }
          steps {
            script {
              try {
                echo "🚀 Foocketing-Publisher GitOps 배포 시작 (Image Tag: ${TAG})"
                
                // Manifest 레포지토리에 push 권한이 있는 SSH 키 자격 증명을 사용합니다.
                // Jenkins Credentials에 ID 'k8s-manifest-repo-ssh-key' 로 미리 등록해야 합니다.
                withCredentials([usernamePassword(credentialsId: 'de12f27e-dd2d-4317-8046-a9ad86c3d720', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
                  sh """
                    #!/bin/sh
                    set -e # 스크립트 중간에 오류 발생 시 즉시 중단

                    echo "==== 1. Git 사용자 정보 설정 ===="
                    git config --global user.name "Jenkins CI"
                    git config --global user.email "lastnyam@gmail.com"
                    
                    echo "==== 2. Manifest 레포지토리 클론 ===="
                    # 작업 공간 충돌을 피하기 위해 임시 디렉터리에 클론
                    rm -rf /tmp/manifest-repo 
                    git clone https://oauth2:${GIT_TOKEN}@lab.ssafy.com/s13-final/S13P31A101.git /tmp/manifest-repo
                    cd /tmp/manifest-repo

                    echo "==== 3. K8s 브랜치로 이동 ===="
                    git checkout K8s

                    echo "==== 4. deployment.yaml 이미지 태그 수정 ===="
                    # sed 명령어를 사용하여 image 태그 부분을 새로운 TAG로 교체합니다.
                    # 파일 경로: app/foocketing-publisher/deployment.yml
                    MANIFEST_FILE="app/foocketing-publisher/deployment.yml"
                    
                    if [ ! -f "\$MANIFEST_FILE" ]; then
                      echo "❌ Manifest 파일(\$MANIFEST_FILE)을 찾을 수 없습니다!"
                      exit 1
                    fi
                    
                    echo "기존 태그: `grep 'image:' \$MANIFEST_FILE`"
                    sed -i "s|image: ${REGISTRY}/foocketing-publisher:.*|image: ${REGISTRY}/foocketing-publisher:${PUB_TAG}|g" "\$MANIFEST_FILE"
                    echo "수정된 태그: `grep 'image:' \$MANIFEST_FILE`"
                    
                    echo "==== 5. 변경사항 커밋 및 푸시 ===="
                    # git diff로 실제 변경사항이 있을 때만 커밋 및 푸시
                    if git diff --quiet; then
                      echo "⏭️ Manifest 파일에 변경사항이 없습니다. 푸시를 건너뜁니다."
                    else
                      git add "\$MANIFEST_FILE"
                      git commit -m "CI: Set image for foocketing-publisher to ${PUB_TAG}"
                      git push origin K8s
                      echo "✅ Manifest 레포지토리에 새로운 이미지 태그를 푸시했습니다."
                    fi
                  """
                } // end withCredentials
                env.DEPLOY_FP_SUCCESS = 'true'

              } catch (Exception e) {
                echo "❌ Foocketing-Publisher 배포 실패: ${e.message}"
                env.DEPLOY_FP_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
      }
    }


    // ==================== FE 빌드/배포 ====================
    stage('FE - 빌드 및 배포') {
      when { expression { return env.IS_FE == 'true' } }
      parallel {
        
        stage('FE Owner 빌드') {
          when { expression { return env.BUILD_FE_OWNER == 'true' } }
          tools {
            nodejs 'NodeJS25'
          }
          steps {
            script {
              try {
                dir('FE/apps/owner-web') {
                  echo '🔨 FE Owner 빌드 중...'
                  sh 'npm ci --include=dev'
                  sh 'npm run build'
                  sh """
                    echo "📦 빌드 결과물을 Nginx로 복사 중..."
                    rm -rf /var/jenkins_home/nginx-build/owner/*
                    cp -r ./dist/* /var/jenkins_home/nginx-build/owner/
                    
                    echo "🔄 Nginx 재시작 중..."
                    docker exec nginx nginx -s reload
                    
                    echo "✅ FE Owner 배포 완료"
                  """
                }
                env.BUILD_FE_OWNER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ FE Owner 빌드 실패: ${e.message}"
                env.BUILD_FE_OWNER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('FE Customer 빌드') {
          when { expression { return env.BUILD_FE_CUSTOMER == 'true' } }
          tools {
            nodejs 'NodeJS25'
          }
          steps {
            script {
              try {
                dir('FE/apps/customer-web') {
                  echo '🔨 FE Customer 빌드 중...'
                  sh 'npm ci --include=dev'
                  withCredentials([
                    file(credentialsId: 'customer-env', variable: 'CUSTOMER_ENV'),
                  ]){
                    sh """
                      cp -r \${CUSTOMER_ENV} ./.env
                      npm run build
                      echo "📦 빌드 결과물을 Nginx로 복사 중..."
                      rm -rf /var/jenkins_home/nginx-build/customer/*
                      cp -r ./dist/* /var/jenkins_home/nginx-build/customer/
                      
                      echo "🔄 Nginx 재시작 중..."
                      docker exec nginx nginx -s reload
                      
                      echo "✅ FE Customer 배포 완료"
                    """
                  }
                }
                env.BUILD_FE_CUSTOMER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ FE Customer 빌드 실패: ${e.message}"
                env.BUILD_FE_CUSTOMER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
      }
    }
  }
  
  post {
    always {
      script {
        def lines = []
        
        if (env.IS_BE == 'true') {
          lines << "╔════════════════════════════════════════════╗"
          lines << "║      BE 빌드 및 배포 결과                  ║"
          lines << "╠════════════════════════════════════════════╣"
          
          if (env.BUILD_CUSTOMER == 'true') {
            lines << "║ 👤 Customer  빌드: ${env.BUILD_CUSTOMER_SUCCESS == 'true' ? '✅' : '❌'} 배포: ${env.DEPLOY_CUSTOMER_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          if (env.BUILD_OWNER == 'true') {
            lines << "║ 🏪 Owner     빌드: ${env.BUILD_OWNER_SUCCESS == 'true' ? '✅' : '❌'} 배포: ${env.DEPLOY_OWNER_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          if (env.BUILD_FS == 'true') {
            lines << "║ 📥 FS        빌드: ${env.BUILD_FS_SUCCESS == 'true' ? '✅' : '❌'} 배포: ${env.DEPLOY_FS_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          if (env.BUILD_FP == 'true') {
            lines << "║ 📤 FP        빌드: ${env.BUILD_FP_SUCCESS == 'true' ? '✅' : '❌'} 배포: ${env.DEPLOY_FP_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          
          lines << "╚════════════════════════════════════════════╝"
        }
        
        if (env.IS_FE == 'true') {
          lines << ""
          lines << "╔════════════════════════════════════════════╗"
          lines << "║      FE 빌드 및 배포 결과                  ║"
          lines << "╠════════════════════════════════════════════╣"
          
          if (env.BUILD_FE_OWNER == 'true') {
            lines << "║ 🏪 FE Owner      빌드: ${env.BUILD_FE_OWNER_SUCCESS == 'true' ? '✅' : '❌'}               ║"
          }
          if (env.BUILD_FE_CUSTOMER == 'true') {
            lines << "║ 👤 FE Customer   빌드: ${env.BUILD_FE_CUSTOMER_SUCCESS == 'true' ? '✅' : '❌'}               ║"
          }
          
          lines << "╚════════════════════════════════════════════╝"
        }
        
        echo lines.join('\n')
      }
    }
    
    success {
      echo "✅ 파이프라인 실행 성공!"
    }
    
    failure {
      echo "❌ 파이프라인 실행 실패! 로그를 확인하세요."
    }
    
    unstable {
      echo "⚠️ 파이프라인 불안정 (일부 모듈 실패)"
    }
    
    cleanup {
      script {
        try {
          cleanWs(
            deleteDirs: true,
            patterns: [
              [pattern: 'BE/*/build', type: 'INCLUDE'],
              [pattern: 'BE/*/.gradle', type: 'INCLUDE'],
              [pattern: 'FE/*/node_modules', type: 'INCLUDE'],
              [pattern: 'FE/*/.next', type: 'INCLUDE']
            ]
          )
        } catch (Exception e) {
          echo "⚠️ 정리 작업 건너뜀: ${e.message}"
        }
      }
    }
  }
}
