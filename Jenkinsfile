pipeline {
    agent any
    triggers {
        pollSCM('H/30 * * * *')
    }
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
    }
    environment {
        sonarScannerHome = tool name: 'sonarscanner'
    }
    stages {
        stage('npm build') {
            agent {
                dockerfile {
                    filename 'Dockerfile'
                    reuseNode true
                    additionalBuildArgs '--tag autoopsltd/ltest:testing'
                }
            }
            steps {
                sh 'npm install'
                sh 'npm install --save-dev jenkins-mocha nyc'
            }
            post {
                success {
                    echo 'NPM install worked.'
                }
                failure {
                    echo 'NPM install failed'
                }
            }
        }
        stage('Gulp Tasks') {
            agent {
                dockerfile {
                    filename 'Dockerfile'
                    reuseNode true
                    additionalBuildArgs '--tag autoopsltd/ltest:testing'
                }
            }
            steps {
                sh 'npm install --save-dev gulp gulp-uglify'
                sh 'node_modules/.bin/gulp scripts'
            }
            post {
                success {
                    echo 'Gulp tasks worked.'
                }
                failure {
                    echo 'Gulp tasks failed'
                }
            }
        }
        stage('mocha/istanbul') {
            agent {
                dockerfile {
                    filename 'Dockerfile'
                    reuseNode true
                    additionalBuildArgs '--tag autoopsltd/ltest:testing'
                }
            }
            steps {
                sh 'npm run test_jenkins'
            }
            post {
                success {
                    echo 'Mocha/Istanbul testing worked.'
                    archiveArtifacts artifacts: 'dist/*.js'
                    junit '**/artifacts/**/*.xml'
                    //publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'coverage', reportFiles: 'index.html', reportName: 'HTML Report', reportTitles: ''])
                    publishHTML([reportDir: 'coverage', reportFiles: 'index.html', reportName: 'Istanbul', reportTitles: '', keepAll: false, alwaysLinkToLastBuild: false, allowMissing: false])
                }
                failure {
                    echo 'Mocha/Istanbul testing failed'
                }
            }
        }
        stage('sonarqube') {
            agent any
            steps {
                withSonarQubeEnv('sonarqube') {
                    withCredentials([string(credentialsId: 'sonar', variable: 'sonarLogin')]) {
                        sh "${sonarScannerHome}/bin/sonar-scanner -e -Dsonar.host.url=http://192.168.1.17:9000 -Dsonar.login=${sonarLogin} -Dsonar.projectName=ltest -Dsonar.projectVersion=${env.BUILD_NUMBER} -Dsonar.projectKey=NA -Dsonar.sources=. -Dsonar.language=js"
                    }
                }
            }
            post {
                success {
                    echo 'Sonar scan & quality gate testing worked.'
                }
                failure {
                    echo 'Sonar scan & quality gate testing failed.'
                }
            }
        }
        stage('Parallel Upload') {
            when {
                branch 'master'
            }
            parallel {
                stage('Upload to Nexus') {
                    agent {
                        dockerfile {
                            filename 'Dockerfile'
                            reuseNode true
                            additionalBuildArgs '--tag autoopsltd/ltest:testing'
                        }
                    }
                    steps {
                        sh 'npm --version'
                        sh './setup_nexus.sh'
                        sh 'npm publish --registry http://192.168.1.17:8082/repository/npm-internal/'
                        sh 'rm -f .npmrc'
                    }
                }
                stage('Upload to Artifactory') {
                    agent {
                        dockerfile {
                            filename 'Dockerfile'
                            reuseNode true
                            additionalBuildArgs '--tag autoopsltd/ltest:testing'
                        }
                    }
                    steps {
                        script {
                            def server = Artifactory.server 'artifactory'
                            def uploadSpec = """{
                              "files": [
                                {
                                  "pattern": "dist/*.js",
                                  "target": "generic-local/ltest",
                                  "recursive": "false"
                                }
                             ]
                            }"""
                            server.upload(uploadSpec)
                            def buildInfo1 = server.upload uploadSpec
                            server.publishBuildInfo buildInfo1
                        }
                    }
                }
            }
            post {
                success {
                    echo 'Artefact uploads completed successfully.'
                }
                failure {
                    echo 'Artefact uploads failed.'
                }
            }
        }
        stage('Docker tag & push') {
            agent {
                dockerfile {
                    filename 'Dockerfile'
                    reuseNode true
                    additionalBuildArgs '--tag autoopsltd/ltest:latest'
                }
            }
            steps {
                withDockerRegistry([ credentialsId: "dockerhub", url: ""]) {
                    sh 'docker tag autoopsltd/ltest:testing autoopsltd/ltest:latest'
                    sh 'docker push autoopsltd/ltest:latest'
                }
            }
            post {
                success {
                    echo 'Docker push completed successfully.'
                }
                failure {
                    echo 'Docker push failed.'
                }
            }
        }
        stage('ansible launch') {
            agent any
            steps {
                sh 'ansible-playbook -i /root/ansible/inventory ./playbook.yml'
            }
            post {
                success {
                    echo 'Ansible playbook ran successfully.'
                }
                failure {
                    echo 'Ansible playbook run failed.'
                }
            }
        }
    }
    post {
        always {
            echo 'Jenkins job finished processing'
        }
        success {
            echo "Jenkins job ${env.JOB_NAME} completed successfully"
            mail to: 'autoopsltd@outlook.com',
                 from: 'admin@jenkins.com',
                 subject: "Jenkins job ${env.JOB_NAME} completed successfully",
                 body: "Pipeline job ${env.JOB_NAME} from branch ${env.BRANCH_NAME} completed successfully.  For more details visit: ${env.BUILD_URL}"
        }
        failure {
            echo "Jenkins job ${env.JOB_NAME} failed"
            mail to: 'autoopsltd@outlook.com',
                 from: 'admin@jenkins.com',
                 subject: "Jenkins job ${env.JOB_NAME} failed",
                 body: "Pipeline job ${env.JOB_NAME} from branch ${env.BRANCH_NAME} failed.  For more details visit: ${env.BUILD_URL}"
        }
        unstable {
            echo "Jenkins job ${env.JOB_NAME} is unstable"
            mail to: 'autoopsltd@outlook.com',
                 from: 'admin@jenkins.com',
                 subject: "Jenkins job ${env.JOB_NAME} is unstable",
                 body: "Pipeline job ${env.JOB_NAME} from branch ${env.BRANCH_NAME} is unstable.  For more details visit: ${env.BUILD_URL}"
        }
    }
}