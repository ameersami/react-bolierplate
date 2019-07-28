#!/bin/groovy
pipeline {
  agent any
  tools {
    nodejs 'recent node'
  }
  stages {
    stage('Prepare') {
      steps {
        script {
          sh 'npm install yarn -g'
          sh 'yarn install'
        }
      }
    }
    stage('Test') {
      steps {
        script {
          sh 'yarn test'
        }
      }
    }
    stage('Build') {
      steps {
        script {
          sh 'yarn build'
        }
      }
    }
    stage('Get JWT Token') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'Portainer', usernameVariable: 'PORTAINER_USERNAME', passwordVariable: 'PORTAINER_PASSWORD')]) {
              def json = """
                  {"Username": "$PORTAINER_USERNAME", "Password": "$PORTAINER_PASSWORD"}
              """
              def jwtResponse = httpRequest acceptType: 'APPLICATION_JSON', contentType: 'APPLICATION_JSON', validResponseCodes: '200', httpMode: 'POST', ignoreSslErrors: true, consoleLogResponseBody: true, requestBody: json, url: "https://portainer.local.laxx.me/api/auth"
              def jwtObject = new groovy.json.JsonSlurper().parseText(jwtResponse.getContent())
              env.JWTTOKEN = "Bearer ${jwtObject.jwt}"
          }
        }
        echo "${env.JWTTOKEN}"
      }
    }
    stage('Build Docker Image on Portainer') {
      steps {
        script {
          // Build the image
          withCredentials([usernamePassword(credentialsId: 'Github', usernameVariable: 'GITHUB_USERNAME', passwordVariable: 'GITHUB_PASSWORD')]) {
              def repoURL = """
                https://portainer.local.laxx.me/api/endpoints/1/docker/build?t=reactapp:latest&remote=https://$GITHUB_USERNAME:$GITHUB_PASSWORD@github.com/$GITHUB_USERNAME/react-bolierplate.git&dockerfile=Dockerfile&nocache=true
              """
              def imageResponse = httpRequest httpMode: 'POST', ignoreSslErrors: true, url: repoURL, validResponseCodes: '200', customHeaders:[[name:"Authorization", value: env.JWTTOKEN ], [name: "cache-control", value: "no-cache"]]
          }
        }
      }
    }
    stage('Delete old Stack') {
      steps {
        script {

          // Get all stacks
          String existingStackId = ""
          if("true") {
            def stackResponse = httpRequest httpMode: 'GET', ignoreSslErrors: true, url: "https://portainer.local.laxx.me/api/stacks", validResponseCodes: '200', consoleLogResponseBody: true, customHeaders:[[name:"Authorization", value: env.JWTTOKEN ], [name: "cache-control", value: "no-cache"]]
            def stacks = new groovy.json.JsonSlurper().parseText(stackResponse.getContent())
            
            stacks.each { stack ->
              if(stack.Name == "BOILERPLATE") {
                existingStackId = stack.Id
              }
            }
          }

          if(existingStackId?.trim()) {
            // Delete the stack
            def stackURL = """
              https://portainer.local.laxx.me/api/stacks/$existingStackId
            """
            httpRequest acceptType: 'APPLICATION_JSON', validResponseCodes: '204', httpMode: 'DELETE', ignoreSslErrors: true, url: stackURL, customHeaders:[[name:"Authorization", value: env.JWTTOKEN ], [name: "cache-control", value: "no-cache"]]

          }

        }
      }
    }
    stage('Deploy new stack to Portainer') {
      steps {
        script {
          
          def createStackJson = ""

          // Stack does not exist
          // Generate JSON for when the stack is created
          withCredentials([usernamePassword(credentialsId: 'Github', usernameVariable: 'GITHUB_USERNAME', passwordVariable: 'GITHUB_PASSWORD')]) {
            def swarmResponse = httpRequest acceptType: 'APPLICATION_JSON', validResponseCodes: '200', httpMode: 'GET', ignoreSslErrors: true, consoleLogResponseBody: true, url: "https://portainer.local.laxx.me/api/endpoints/1/docker/swarm", customHeaders:[[name:"Authorization", value: env.JWTTOKEN ], [name: "cache-control", value: "no-cache"]]
            def swarmInfo = new groovy.json.JsonSlurper().parseText(swarmResponse.getContent())

            createStackJson = """
              {"Name": "BOILERPLATE", "SwarmID": "$swarmInfo.ID", "RepositoryURL": "https://github.com/$GITHUB_USERNAME/react-bolierplate", "ComposeFilePathInRepository": "docker-compose.yml", "RepositoryAuthentication": true, "RepositoryUsername": "$GITHUB_USERNAME", "RepositoryPassword": "$GITHUB_PASSWORD"}
            """

          }

          if(createStackJson?.trim()) {
            httpRequest acceptType: 'APPLICATION_JSON', contentType: 'APPLICATION_JSON', validResponseCodes: '200', httpMode: 'POST', ignoreSslErrors: true, consoleLogResponseBody: true, requestBody: createStackJson, url: "https://portainer.local.laxx.me/api/stacks?method=repository&type=1&endpointId=1", customHeaders:[[name:"Authorization", value: env.JWTTOKEN ], [name: "cache-control", value: "no-cache"]]
          }

        }
      }
    }
  }
}
