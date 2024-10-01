pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    // Build and run Docker Compose
                    sh 'docker-compose -f docker-compose.yml up -d'
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    // Run your tests here
                    sh 'docker-compose -f docker-compose.yml exec web echo "Running tests..."'
                }
            }
        }
        stage('Teardown') {
            steps {
                script {
                    // Stop and remove Docker Compose services
                    sh 'docker-compose -f docker-compose.yml down'
                }
            }
        }
    }
}
