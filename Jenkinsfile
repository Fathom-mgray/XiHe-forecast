pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    // Build and run Docker Compose
                    sh 'docker-compose -f docker-compose.yml up -d --build'
                }
            }
        }
    }
}
