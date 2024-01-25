# Thesis-Demo-System

Before running any files, please ensure that an Ethereum account with enough Sepolia test Ether has been added to the .env files in the backend and smart contract folders. Simply replace the value after PRIVATE_KEY with the private key of an Ethereum account. When running two clients (service provider and user), use ports 3000 and 3001. 

Link to PDF: https://drive.google.com/file/d/1GZX52tgYBrrWDWEJR7UFbi6ekviBF0gG/view?usp=drive_link
The PDF above goes through the system and how to run it in more detail.


# Backend 

From the root directory, go to the backend folder.

  	cd backend
  
Install the JavaScript dependencies.

  	npm install
  
Run the backend using the following command.

	node server.js


# Frontend 

From the root directory, go to the frontend folder.

  	cd frontend/my-app
  
Install the JavaScript dependencies.

  	npm install
  
Run the frontend using the following command.

	npm install


# Smart Contract Tests

From the root directory, go to the reputation system folder.

  	cd hardhat-reputation-system
  
Run the smart contract tests using the following command.

	yarn hardhat test

