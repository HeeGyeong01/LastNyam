pipeline {
  agent any
  
  environment {
    REGISTRY = '941kjw'
    TAG = "latest"
    GRADLE_OPTS = '-Dorg.gradle.daemon=false -Dorg.gradle.parallel=true'
  }

  stages {
    stage('Detect Branch & Changes') {
      steps {
        script {
          // 브랜치 이름 확인
          def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH
          echo "🌿 Current Branch: ${branchName}"
          
          // Git diff 추출
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
          
          // BE/master 브랜치 로직
          if (branchName == 'BE/master' || branchName == 'origin/BE/master') {
            def commonModules = ['core', 'common', 'authentication', 'database']
            def isCommonChanged = commonModules.any { changes.contains("BE/${it}/") }
            def isMessagingChanged = changes.contains('BE/messaging/')
            
            env.BUILD_USER = (changes.contains('BE/user/') || isCommonChanged).toString()
            env.BUILD_OWNER = (changes.contains('BE/owner/') || isCommonChanged).toString()
            env.BUILD_FS = (changes.contains('BE/foocketing-subscriber/') || isCommonChanged || isMessagingChanged).toString()
            env.BUILD_FP = (changes.contains('BE/foocketing-publisher/') || isCommonChanged || isMessagingChanged).toString()
            
            env.IS_BE = 'true'
            env.IS_FE = 'false'
            
            echo """
┌─────────────────────────────────────────┐
│      BE BUILD PLAN                      │
├─────────────────────────────────────────┤
│ 👤 User              : ${env.BUILD_USER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 🏪 Owner             : ${env.BUILD_OWNER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 📥 Foocketing-Sub    : ${env.BUILD_FS == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 📤 Foocketing-Pub    : ${env.BUILD_FP == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
└─────────────────────────────────────────┘
            """
          }
          // FE/master 브랜치 로직
          else if (branchName == 'FE/master' || branchName == 'origin/FE/master') {
            def isSharedChanged = changes.contains('FE/shared/')
            def isOwnerChanged = changes.contains('FE/apps/owner-web/')
            def isCustomerChanged = changes.contains('FE/apps/customer-web/')
            
            // shared 변경 시 둘 다 빌드
            env.BUILD_FE_OWNER = (isOwnerChanged || isSharedChanged).toString()
            env.BUILD_FE_CUSTOMER = (isCustomerChanged || isSharedChanged).toString()
            
            env.IS_BE = 'false'
            env.IS_FE = 'true'
            
            echo """
┌─────────────────────────────────────────┐
│      FE BUILD PLAN                      │
├─────────────────────────────────────────┤
│ 🏪 Owner             : ${env.BUILD_FE_OWNER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 👤 Customer          : ${env.BUILD_FE_CUSTOMER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
├─────────────────────────────────────────┤
│ Shared 변경: ${isSharedChanged ? 'YES' : 'NO'}                │
└─────────────────────────────────────────┘
            """
          }
          else {
            echo "⏭️ Skipping: Branch ${branchName} not configured"
            env.IS_BE = 'false'
            env.IS_FE = 'false'
          }
        }
      }
    }

    // ==================== BE 빌드/배포 ====================
    stage('BE - Prepare Build') {
      when { expression { return env.IS_BE == 'true' } }
      steps {
        dir('BE') {
          echo '🔧 Setting gradlew permissions...'
          sh 'chmod +x gradlew'
        }
      }
    }
    
    stage('BE - Build & Push Images') {
      when { expression { return env.IS_BE == 'true' } }
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
    
    stage('BE - Deploy Services') {
      when { expression { return env.IS_BE == 'true' } }
      parallel {
        stage('Deploy User') {
          when { expression { return env.BUILD_USER == 'true' } }
          steps {
            script {
              echo '🚀 Deploying User Service...'
              sh """
                set -e
                cd /var/scripts
                docker-compose -f user.yml up -d
                
                echo "⏳ Waiting for service..."
                for i in {1..30}; do
                  if docker-compose ps user | grep -q "Up"; then
                    echo "✅ User service deployed"
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
              sh """
                set -e
                cd /var/scripts
                docker-compose -f owner.yml up -d
                
                echo "⏳ Waiting for service..."
                for i in {1..30}; do
                  if docker-compose ps owner | grep -q "Up"; then
                    echo "✅ Owner service deployed"
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
                docker-compose -f foocketing-subscriber.yml up -d
                
                echo "⏳ Waiting for service..."
                for i in {1..30}; do
                  if docker-compose ps foocketing-subscriber | grep -q "Up"; then
                    echo "✅ FS deployed"
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
                    --prune --timeout 300 \
                    --auth-token \$TOKEN
                  
                  argocd app wait foocketing-publisher \
                    --health --timeout 300 \
                    --auth-token \$TOKEN
                  
                  echo "✅ FP deployed"
                """
              }
            }
          }
        }
      }
    }

    // ==================== FE 빌드/배포 ====================
    stage('FE - Build & Deploy') {
      when { expression { return env.IS_FE == 'true' } }
      tools{
          nodejs 'NodeJS25'
      }
      parallel {
        stage('Build FE Owner') {
          when { expression { return env.BUILD_FE_OWNER == 'true' } }
          steps {
            dir('FE/apps/owner-web') {
              echo '🔨 Building FE Owner...'
              sh 'npm install'
              sh 'npm run build'
              // Docker 빌드 또는 정적 파일 배포
              sh """
                echo "📦 Copying build artifacts to Nginx..."
                rm -rf /var/jenkins_home/nginx-build/owner/*
                cp -r ./dist/* /var/jenkins_home/nginx-build/owner/
                echo "✅ Build artifacts copied successfully"
              """
            }
          }
        }
        
        stage('Build FE Customer') {
          when { expression { return env.BUILD_FE_CUSTOMER == 'true' } }
          steps {
            dir('FE/apps/customer-web') {
              echo '🔨 Building FE Customer...'
              sh 'npm install'
              sh 'npm run build'
              sh """
                echo "📦 Copying build artifacts to Nginx..."
                rm -rf /var/jenkins_home/nginx-build/customer/*
                cp -r ./dist/* /var/jenkins_home/nginx-build/customer/
                echo "✅ Build artifacts copied successfully"
              """
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
        if (env.IS_BE == 'true') {
          if (env.BUILD_USER == 'true') deployed << 'BE-User'
          if (env.BUILD_OWNER == 'true') deployed << 'BE-Owner'
          if (env.BUILD_FS == 'true') deployed << 'BE-FS'
          if (env.BUILD_FP == 'true') deployed << 'BE-FP'
        }
        if (env.IS_FE == 'true') {
          if (env.BUILD_FE_OWNER == 'true') deployed << 'FE-Owner'
          if (env.BUILD_FE_CUSTOMER == 'true') deployed << 'FE-Customer'
        }
        
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
              [pattern: 'BE/*/.gradle', type: 'INCLUDE'],
              [pattern: 'FE/*/node_modules', type: 'INCLUDE'],
              [pattern: 'FE/*/.next', type: 'INCLUDE']
            ]
          )
        } catch (Exception e) {
          echo "⚠️ Cleanup skipped: ${e.message}"
        }
      }
    }
  }
}
