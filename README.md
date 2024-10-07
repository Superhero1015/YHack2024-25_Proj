# Cropscape
Cropscape analyzes location-specific soil, climate, and hardiness data to provide personalized crop recommendations for a thriving backyard garden.

You MUST have a .env file in the 'backend' folder with the following contents:

    LIGHTBOX_API_KEY= ###
    USDA_SOIL_API_KEY= ###
    OPENAI_API_KEY= ###

    DB_HOST= ###
    DB_USER= ###
    DB_PASSWORD= ###
    DB_NAME= ###
    DB_PORT= ###

If such a file does not already exist, make one. (Replace '###' with the correct values)

To test this code, you need to open 2 terminal pages up
One should be 'cd'-ed into the 'backend' folder, and the other should be 'cd'-ed into 'frontend'

You need to run 'npm start' in BOTH the backend and frontend to run the project.

