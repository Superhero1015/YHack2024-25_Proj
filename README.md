# Cropscape
Cropscape analyzes location-specific soil, climate, and hardiness data to provide personalized crop recommendations for a thriving backyard garden.

How to run Cropscape in a local environment:

    You MUST have a .env file in the 'backend' folder with the following contents:

        LIGHTBOX_API_KEY= ###
        USDA_SOIL_API_KEY= ###
        OPENAI_API_KEY= ###

        DB_HOST= ###
        DB_USER= ###
        DB_PASSWORD= ###
        DB_NAME= ###
        DB_PORT= ###

    If such a file does not already exist, make one. (Replace the '###'s with the correct values. The OpenAI key can be taken from your own OpenAI account)
y
    To run this code, you need to open 2 terminal pages up in your code editor.
    One terminal should be 'cd'-ed into the 'backend' folder, and the other should be 'cd'-ed into 'frontend'

    You need to run 'npm start' in BOTH the backend and frontend terminals to run the project. I recommend running 'npm start' in the frontend first.

    If you run into errors, I recommend removing all instances of 'node' at ports 3000 and 8080 in both terminals. To do this, you run 'lsof -i :###' and 'kill -9 ###' where the first '###' is replaced with either 8080 or 3000, and the second '###' is replaced by the port number of the found instance of node, if any.

    When all is working, go to 'http://localhost:8080/' in the browser. Feel free to use f12 to examine the code further.

