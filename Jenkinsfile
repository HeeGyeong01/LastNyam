pipeline {
  agent any
  
  environment {
    REGISTRY = '941kjw'
    TAG = "latest"
    GRADLE_OPTS = '-Dorg.gradle.daemon=false -Dorg.gradle.parallel=true'
    COMPOSE_FILE = '/var/scripts/docker-compose.yml'  // 파일명 추가!
  }
  
  stages {
    stage('Detect Changes') {
      steps {
        script {
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
          echo "📋 실제 Git diff 결과:"
          echo changes
          echo "=" * 50
          
          def commonModules = ['core', 'common', 'authentication', 'database']
          def isCommonChanged = commonModules.any { changes.contains("BE/${it}/") }
          def isMessagingChanged = changes.contains('BE/messaging/')
          
          env.BUILD_USER = (changes.contains('BE/user/') || isCommonChanged).toString()
          env.BUILD_OWNER = (changes.contains('BE/owner/') || isCommonChanged).toString()
          env.BUILD_FS = (changes.contains('BE/foocketing-subscriber/') || isCommonChanged || isMessagingChanged).toString()
          env.BUILD_FP = (changes.contains('BE/foocketing-publisher/') || isCommonChanged || isMessagingChanged).toString()
          
          echo """
┌─────────────────────────────────────────┐
│      BUILD PLAN                         │
├─────────────────────────────────────────┤
│ 👤 User              : ${env.BUILD_USER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 🏪 Owner             : ${env.BUILD_OWNER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 📥 Foocketing-Sub    : ${env.BUILD_FS == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 📤 Foocketing-Pub    : ${env.BUILD_FP == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
├─────────────────────────────────────────┤
│ 공통 모듈 변경: ${isCommonChanged ? 'YES' : 'NO'}              │
│ 메시징 변경   : ${isMessagingChanged ? 'YES' : 'NO'}              │
└─────────────────────────────────────────┘
          """
        }
      }
    }

    stage('Prepare Build') {
      steps {
        dir('BE') {
          echo '🔧 Setting gradlew permissions...'
          sh 'chmod +x gradlew'
        }
      }
    }
    
    stage('Build & Push Images') {
      parallel {
        stage('Build User') {
          when { expression { return env.BUILD_USER == 'true' } }
          steps {
            dir('BE') {
              echo '🔨 Building User Service...'
              
              sh './gradlew :user:clean :user:bootJar --parallel --build-cache'
              sh """
                docker build \
                  --cache-from ${REGISTRY}/user:latest \
                  -t ${REGISTRY}/user:${TAG} \
                  -f user/Dockerfile .
              """
            }
          }
        }
        
        stage('Build Owner') {
          when { expression { return env.BUILD_OWNER == 'true' } }
          steps {
            dir('BE') {
              echo '🔨 Building Owner Service...'
              
              sh './gradlew :owner:clean :owner:bootJar --parallel --build-cache'
              sh """
                docker build \
                  --cache-from ${REGISTRY}/owner:latest \
                  -t ${REGISTRY}/owner:${TAG} \
                  -f owner/Dockerfile .
              """
            }
          }
        }
        
        stage('Build FS') {
          when { expression { return env.BUILD_FS == 'true' } }
          steps {
            dir('BE') {
              echo '🔨 Building Foocketing-Subscriber...'
              
              sh './gradlew :foocketing-subscriber:clean :foocketing-subscriber:bootJar --parallel --build-cache'
              sh """
                docker build \
                  --cache-from ${REGISTRY}/foocketing-subscriber:latest \
                  -t ${REGISTRY}/foocketing-subscriber:${TAG} \
                  -f foocketing-subscriber/Dockerfile .
              """
            }
          }
        }
        
        stage('Build FP') {
          when { expression { return env.BUILD_FP == 'true' } }
          steps {
            dir('BE') {
              echo '🔨 Building Foocketing-Publisher...'
              
              sh './gradlew :foocketing-publisher:clean :foocketing-publisher:bootJar --parallel --build-cache'
              sh """
                docker build \
                  --cache-from ${REGISTRY}/foocketing-publisher:latest \
                  -t ${REGISTRY}/foocketing-publisher:${TAG} \
                  -f foocketing-publisher/Dockerfile .
              """
            }
          }
        }
      }
    }
    
    stage('Deploy Services') {
      parallel {
        stage('Deploy User') {
          when { expression { return env.BUILD_USER == 'true' } }
          steps {
            script {
              echo '🚀 Deploying User Service...'
              sh """
                set -e
                cd /var/scripts
                                
                # 배포
                docker-compose -f user.yml up -d
                
                # Health check
                echo "⏳ Waiting for service..."
                for i in {1..30}; do
                  if docker-compose ps user | grep -q "Up"; then
                    echo "✅ User service deployed"
                    docker-compose ps user
                    exit 0
                  fi
                  sleep 1
                done

                echo "❌ Deploy timeout"
                exit 1
              """
            }
          }
        }
        
        stage('Deploy Owner') {
          when { expression { return env.BUILD_OWNER == 'true' } }
          steps {
            script {
              echo '🚀 Deploying Owner Service...'
              sh  """
                set -e
                cd /var/scripts
                                
                # 배포
                docker-compose -f owner.yml up -d
                
                # Health check
                echo "⏳ Waiting for service..."
                for i in {1..30}; do
                  if docker-compose ps owner | grep -q "Up"; then
                    echo "✅ Owner service deployed"
                    docker-compose ps owner
                    exit 0
                  fi
                  sleep 1
                done

                echo "❌ Deploy timeout"
                exit 1
              """
            }
          }
        }
        
        stage('Deploy FS') {
          when { expression { return env.BUILD_FS == 'true' } }
          steps {
            script {
              echo '🚀 Deploying Foocketing-Subscriber...'
              sh """
                 set -e
                cd /var/scripts
                                
                # 배포
                docker-compose -f foocketing-subscriber.yml up -d
                
                # Health check
                echo "⏳ Waiting for service..."
                for i in {1..30}; do
                  if docker-compose ps foocketing-subscriber | grep -q "Up"; then
                    echo "✅ Foocketing-Subscriber service deployed"
                    docker-compose ps foocketing-subscriber
                    exit 0
                  fi
                  sleep 1
                done

                echo "❌ Deploy timeout"
                exit 1
              """
            }
          }
        }
        
        stage('Deploy FP') {
          when { expression { return env.BUILD_FP == 'true' } }
          steps {
            script {
              echo '🚀 Deploying Foocketing-Publisher via ArgoCD...'
              withCredentials([string(credentialsId: 'argocd-token', variable: 'TOKEN')]) {
                sh """
                  argocd app set foocketing-publisher \
                    -p image.tag=${TAG} \
                    --auth-token \$TOKEN
                  
                  argocd app sync foocketing-publisher \
                    --prune \
                    --timeout 300 \
                    --auth-token \$TOKEN
                  
                  argocd app wait foocketing-publisher \
                    --health \
                    --timeout 300 \
                    --auth-token \$TOKEN
                  
                  echo "✅ Foocketing-Publisher deployed"
                """
              }
            }
          }
        }
      }
    }
  }
  
  post {
    success {
      script {
        def deployed = []
        if (env.BUILD_USER == 'true') deployed << 'User'
        if (env.BUILD_OWNER == 'true') deployed << 'Owner'
        if (env.BUILD_FS == 'true') deployed << 'FS'
        if (env.BUILD_FP == 'true') deployed << 'FP'
        
        echo """
┌─────────────────────────────────────────┐
│  ✅ DEPLOYMENT SUCCESSFUL               │
├─────────────────────────────────────────┤
│ Build #${BUILD_NUMBER}                  │
│ Deployed: ${deployed.join(', ')}        │
└─────────────────────────────────────────┘
        """
      }
    }
    
    failure {
      echo "❌ Deployment #${BUILD_NUMBER} failed!"
    }
    
    cleanup {
      script {
        try {
          cleanWs(
            deleteDirs: true,
            patterns: [
              [pattern: 'BE/*/build', type: 'INCLUDE'],
              [pattern: 'BE/*/.gradle', type: 'INCLUDE']
            ]
          )
        } catch (Exception e) {
          echo "⚠️ Cleanup skipped: ${e.message}"
        }
      }
    }
  }
}
