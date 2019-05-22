FROM node:11-slim

# Set working dir
RUN mkdir /app
WORKDIR /app

# Copy files and remove node_modules dir if accidently copied
copy . /app
RUN rm -rf ./node_modules

# Install yarn then install deps
RUN npm install yarn -g
RUN yarn install

# Build app
RUN yarn build

#Expose ports
EXPOSE 8080

ENTRYPOINT ["yarn", "start"]


