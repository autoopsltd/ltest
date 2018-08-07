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
                    //archiveArtifacts artifacts: 'app/*.js'
                    //junit '**/artifacts/**/*.xml'
                    //publishHTML([reportDir: coverage, reportFiles: 'index.html', reportName: 'Istanbul', reportTitles: '', keepAll: false, alwaysLinkToLastBuild: false, allowMissing: false])
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
                    echo "Pipeline job ${env.JOB_NAME} completed successfully with no errors."
                    mail to: 'autoopsltd@outlook.com',
                         from: 'jenkins_admin@jenkins.com',
                         subject: "Pipeline Successful : ${env.JOB_NAME}",
                         body: "Pipeline job ${env.JOB_NAME} from branch ${env.BRANCH_NAME} completed successfully.  For further details visit ${env.BUILD_URL}."
        }
        //success {
          //  echo "Jenkins job ${env.JOB_NAME} completed successfully"
            //mail to: 'autoopsltd@outlook.com'
              //   from: 'admin@jenkins.com'
                // subject: "Jenkins job ${env.JOB_NAME} completed successfully"
                 //body: "Pipeline job ${env.JOB_NAME} from branch ${env.BRANCH_NAME} completed successfully.  For more details visit: ${env.BUILD_URL}"
        //}
        // failure {
        //     echo "Jenkins job ${env.JOB_NAME} failed"
        //     mail to: 'autoopsltd@outlook.com'
        //          from: 'admin@jenkins.com'
        //          subject: "Jenkins job ${env.JOB_NAME} failed"
        //          body: "Pipeline job ${env.JOB_NAME} from branch ${env.BRANCH_NAME} failed.  For more details visit: ${env.BUILD_URL}"
        // }
        // unstable {
        //     echo "Jenkins job ${env.JOB_NAME} is unstable"
        //     mail to: 'autoopsltd@outlook.com'
        //          from: 'admin@jenkins.com'
        //          subject: "Jenkins job ${env.JOB_NAME} is unstable"
        //          body: "Pipeline job ${env.JOB_NAME} from branch ${env.BRANCH_NAME} is unstable.  For more details visit: ${env.BUILD_URL}"
        // }
    }
}