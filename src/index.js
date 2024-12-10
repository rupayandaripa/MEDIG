import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';


dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.on("error" , (error) => {
        console.log("ERROR:: ", error)
        throw error
    })

    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at port: ${process.env.PORT}`)
    })

    app.get("/auth/callback", async (req, res) => {
        const pca = new PublicClientApplication(msalConfig);
    
        const tokenResponse = await pca.acquireTokenByCode({
            code: req.query.code,
            scopes: ["Mail.Send", "User.Read"],
            redirectUri: "http://localhost:8000/auth/callback",
        });
    
        const accessToken = tokenResponse.accessToken;
        if (!accessToken) {
            throw new ApiError(401, "Failed to acquire access token");
        }
    
        req.session.accessToken = accessToken; // Store the token in session
        res.send("User logged in successfully");
    });
})
.catch((e) => {
    console.log("MONGO DB connection fails!!" , e)
})