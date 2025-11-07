pipeline {
  agent any
  
  parameters {
    booleanParam(
      name: 'FORCE_BUILD_ALL', 
      defaultValue: false, 
      description: '🔥 모든 모듈 강제 빌드 (변경사항 무시)'
    )
  }

  environment {
    REGISTRY = '941kjw'
    TAG = "latest"
    GRADLE_OPTS = '-Dorg.gradle.daemon=false -Dorg.gradle.parallel=true'
  }

  stages {
    stage('Detect Branch & Changes') {
      steps {
        script {
          def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH
          echo "🌿 Current Branch: ${branchName}"
          
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
            
            env.BUILD_CUSTOMER = (params.FORCE_BUILD_ALL || changes.contains('BE/customer/') || isCommonChanged).toString()
            env.BUILD_OWNER = (params.FORCE_BUILD_ALL || changes.contains('BE/owner/') || isCommonChanged).toString()
            env.BUILD_FS = (params.FORCE_BUILD_ALL || changes.contains('BE/foocketing-subscriber/') || isCommonChanged || isMessagingChanged).toString()
            env.BUILD_FP = (params.FORCE_BUILD_ALL || changes.contains('BE/foocketing-publisher/') || isCommonChanged || isMessagingChanged).toString()
            
            env.IS_BE = 'true'
            env.IS_FE = 'false'
            
            echo """
┌─────────────────────────────────────────┐
│      BE BUILD PLAN                      │
├─────────────────────────────────────────┤
│ 👤 Customer              : ${env.BUILD_CUSTOMER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 🏪 Owner                 : ${env.BUILD_OWNER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 📥 Foocketing-Sub        : ${env.BUILD_FS == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 📤 Foocketing-Pub        : ${env.BUILD_FP == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
└─────────────────────────────────────────┘
            """
          }
          else if (branchName == 'FE/master' || branchName == 'origin/FE/master') {
            def isSharedChanged = changes.contains('FE/shared/')
            def isOwnerChanged = changes.contains('FE/owner/')
            def isCustomerChanged = changes.contains('FE/customer/')
            
            env.BUILD_FE_OWNER = (params.FORCE_BUILD_ALL || isOwnerChanged || isSharedChanged).toString()
            env.BUILD_FE_CUSTOMER = (params.FORCE_BUILD_ALL || isCustomerChanged || isSharedChanged).toString()
            
            env.IS_BE = 'false'
            env.IS_FE = 'true'
            
            echo """
┌─────────────────────────────────────────┐
│      FE BUILD PLAN                      │
├─────────────────────────────────────────┤
│ 🏪 Owner                 : ${env.BUILD_FE_OWNER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
│ 👤 Customer              : ${env.BUILD_FE_CUSTOMER == 'true' ? '✅ BUILD' : '⏭️  SKIP '} │
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
        
        
        stage('Build Customer') {
          when { expression { return env.BUILD_CUSTOMER == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Building Customer Service...'
                  sh './gradlew :customer:clean :customer:bootJar --parallel --build-cache'
                  sh """
                    docker build \
                      --cache-from ${REGISTRY}/customer:latest \
                      -t ${REGISTRY}/customer:${TAG} \
                      -f customer/Dockerfile .
                  """
                  env.BUILD_CUSTOMER_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ Customer build failed: ${e.message}"
                env.BUILD_CUSTOMER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Build Owner') {
          when { expression { return env.BUILD_OWNER == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Building Owner Service...'
                  sh './gradlew :owner:clean :owner:bootJar --parallel --build-cache'
                  sh """
                    docker build \
                      --cache-from ${REGISTRY}/owner:latest \
                      -t ${REGISTRY}/owner:${TAG} \
                      -f owner/Dockerfile .
                  """
                  env.BUILD_OWNER_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ Owner build failed: ${e.message}"
                env.BUILD_OWNER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Build FS') {
          when { expression { return env.BUILD_FS == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Building Foocketing-Subscriber...'
                  sh './gradlew :foocketing-subscriber:clean :foocketing-subscriber:bootJar --parallel --build-cache'
                  sh """
                    docker build \
                      --cache-from ${REGISTRY}/foocketing-subscriber:latest \
                      -t ${REGISTRY}/foocketing-subscriber:${TAG} \
                      -f foocketing-subscriber/Dockerfile .
                  """
                  env.BUILD_FS_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ FS build failed: ${e.message}"
                env.BUILD_FS_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Build FP') {
          when { expression { return env.BUILD_FP == 'true' } }
          steps {
            script {
              try {
                dir('BE') {
                  echo '🔨 Building Foocketing-Publisher...'
                  sh './gradlew :foocketing-publisher:clean :foocketing-publisher:bootJar --parallel --build-cache'
                  sh """
                    docker build \
                      --cache-from ${REGISTRY}/foocketing-publisher:latest \
                      -t ${REGISTRY}/foocketing-publisher:${TAG} \
                      -f foocketing-publisher/Dockerfile .
                  """
                  env.BUILD_FP_SUCCESS = 'true'
                }
              } catch (Exception e) {
                echo "❌ FP build failed: ${e.message}"
                env.BUILD_FP_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
      }
    }
    
    stage('BE - Deploy Services') {
      when { expression { return env.IS_BE == 'true' } }
      parallel {
        
        
        stage('Deploy Customer') {
          when { expression { return env.BUILD_CUSTOMER == 'true' && env.BUILD_CUSTOMER_SUCCESS == 'true' } }
          steps {
            script {
              try {
                echo '🚀 Deploying Customer Service...'
                sh """
                  set -e
                  cd /var/scripts
                  docker compose -f customer.yml up -d
                  
                  echo "⏳ Waiting for service..."
                  for i in {1..30}; do
                    if docker compose ps customer | grep -q "Up"; then
                      echo "✅ Customer service deployed"
                      exit 0
                    fi
                    sleep 1
                  done
                  echo "❌ Deploy timeout"
                  exit 1
                """
                env.DEPLOY_CUSTOMER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ Customer deploy failed: ${e.message}"
                env.DEPLOY_CUSTOMER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Deploy Owner') {
          when { expression { return env.BUILD_OWNER == 'true' && env.BUILD_OWNER_SUCCESS == 'true' } }
          steps {
            script {
              try {
                echo '🚀 Deploying Owner Service...'
                sh """
                  set -e
                  cd /var/scripts
                  docker compose -f owner.yml up -d
                  
                  echo "⏳ Waiting for service..."
                  for i in {1..30}; do
                    if docker compose ps owner | grep -q "Up"; then
                      echo "✅ Owner service deployed"
                      exit 0
                    fi
                    sleep 1
                  done
                  echo "❌ Deploy timeout"
                  exit 1
                """
                env.DEPLOY_OWNER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ Owner deploy failed: ${e.message}"
                env.DEPLOY_OWNER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Deploy FS') {
          when { expression { return env.BUILD_FS == 'true' && env.BUILD_FS_SUCCESS == 'true' } }
          steps {
            script {
              try {
                echo '🚀 Deploying Foocketing-Subscriber...'
                sh """
                  set -e
                  cd /var/scripts
                  docker compose -f foocketing-subscriber.yml up -d
                  
                  echo "⏳ Waiting for service..."
                  for i in {1..30}; do
                    if docker compose ps foocketing-subscriber | grep -q "Up"; then
                      echo "✅ FS deployed"
                      exit 0
                    fi
                    sleep 1
                  done
                  echo "❌ Deploy timeout"
                  exit 1
                """
                env.DEPLOY_FS_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ FS deploy failed: ${e.message}"
                env.DEPLOY_FS_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Deploy FP') {
          when { expression { return env.BUILD_FP == 'true' && env.BUILD_FP_SUCCESS == 'true' } }
          steps {
            script {
              try {
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
                env.DEPLOY_FP_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ FP deploy failed: ${e.message}"
                env.DEPLOY_FP_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
      }
    }

    // ==================== FE 빌드/배포 ====================
    stage('FE - Build & Deploy') {
      when { expression { return env.IS_FE == 'true' } }
      parallel {
        
        
        stage('Build FE Owner') {
          when { expression { return env.BUILD_FE_OWNER == 'true' } }
          tools {
            nodejs 'NodeJS25'
          }
          steps {
            script {
              try {
                dir('FE/apps/owner-web') {
                  echo '🔨 Building FE Owner...'
                  sh 'npm install'
                  sh 'npm run build'
                  sh """
                    echo "📦 Copying build artifacts to Nginx..."
                    rm -rf /var/jenkins_home/nginx-build/owner/*
                    cp -r ./dist/* /var/jenkins_home/nginx-build/owner/
                    
                    echo "🔄 Reloading Nginx..."
                    docker exec nginx nginx -s reload
                    
                    echo "✅ FE Owner deployed and Nginx reloaded"
                  """
                }
                env.BUILD_FE_OWNER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ FE Owner build failed: ${e.message}"
                env.BUILD_FE_OWNER_SUCCESS = 'false'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        
        stage('Build FE Customer') {
          when { expression { return env.BUILD_FE_CUSTOMER == 'true' } }
          tools {
            nodejs 'NodeJS25'
          }
          steps {
            script {
              try {
                dir('FE/apps/customer-web') {
                  echo '🔨 Building FE Customer...'
                  sh 'npm install'
                  sh 'npm run build'
                  sh """
                    echo "📦 Copying build artifacts to Nginx..."
                    rm -rf /var/jenkins_home/nginx-build/customer/*
                    cp -r ./dist/* /var/jenkins_home/nginx-build/customer/
                    
                    echo "🔄 Reloading Nginx..."
                    docker exec nginx nginx -s reload
                    
                    echo "✅ FE Customer deployed and Nginx reloaded"
                  """
                }
                env.BUILD_FE_CUSTOMER_SUCCESS = 'true'
              } catch (Exception e) {
                echo "❌ FE Customer build failed: ${e.message}"
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
          lines << "║      BE BUILD & DEPLOY REPORT              ║"
          lines << "╠════════════════════════════════════════════╣"
          
          if (env.BUILD_CUSTOMER == 'true') {
            lines << "║ 👤 Customer  Build: ${env.BUILD_CUSTOMER_SUCCESS == 'true' ? '✅' : '❌'} Deploy: ${env.DEPLOY_CUSTOMER_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          if (env.BUILD_OWNER == 'true') {
            lines << "║ 🏪 Owner     Build: ${env.BUILD_OWNER_SUCCESS == 'true' ? '✅' : '❌'} Deploy: ${env.DEPLOY_OWNER_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          if (env.BUILD_FS == 'true') {
            lines << "║ 📥 Foocketing-Sub Build: ${env.BUILD_FS_SUCCESS == 'true' ? '✅' : '❌'} Deploy: ${env.DEPLOY_FS_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          if (env.BUILD_FP == 'true') {
            lines << "║ 📤 Foocketing-Pub Build: ${env.BUILD_FP_SUCCESS == 'true' ? '✅' : '❌'} Deploy: ${env.DEPLOY_FP_SUCCESS == 'true' ? '✅' : '⏭️'} ║"
          }
          
          lines << "╚════════════════════════════════════════════╝"
        }
        
        if (env.IS_FE == 'true') {
          lines << ""
          lines << "╔════════════════════════════════════════════╗"
          lines << "║      FE BUILD & DEPLOY REPORT              ║"
          lines << "╠════════════════════════════════════════════╣"
          
          if (env.BUILD_FE_OWNER == 'true') {
            lines << "║ 🏪 FE Owner      Build: ${env.BUILD_FE_OWNER_SUCCESS == 'true' ? '✅' : '❌'} ║"
          }
          if (env.BUILD_FE_CUSTOMER == 'true') {
            lines << "║ 👤 FE Customer   Build: ${env.BUILD_FE_CUSTOMER_SUCCESS == 'true' ? '✅' : '❌'} ║"
          }
          
          lines << "╚════════════════════════════════════════════╝"
        }
        
        echo lines.join('\n')
      }
    }
    
    success {
      echo "✅ Pipeline completed successfully!"
    }
    
    failure {
      echo "❌ Pipeline failed! Check logs above."
    }
    
    unstable {
      echo "⚠️ Pipeline completed with warnings (some modules failed)"
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
