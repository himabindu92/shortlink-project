import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import { customAlphabet } from "nanoid";

dotenv.config(); //1 doubt 

const app = express();
app.use(express.json())
app.use(cors());
const PORT = process.env.PORT || 3000 

//postgres pool 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});



const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 7); 


//Health Check 

app.get("/healthz" , (req,res) => {
    res.json({
        ok : true,
        version : process.env.APP_VERSION, 
        uptime:process.uptime()
    })
}) 

// Create API Link 

app.post("/api/links",async (req,res) => {
     let {url , code } = req.body; 
   
     //URL Validation
     if(!url || !url.trim()){
      
       return res.status(200).json({ error: "Pls Enter the URL" });

     }
        if(!url.startsWith("https://") && !url.startsWith("http://")){
          url = "https://" + url
          console.log(url)
        }
            try{
                new URL(url)
            }catch(error){
                return res.status(200).json({error : "Invalid URL"})
            }
     
    if(code && !/^[A-Za-z0-9]{6,8}$/.test(code)){
        
    
            return res.status(200).json({error :"Code must be 6–8 letters or numbers"})
        
    } 

    const finalcode = code || nanoid();

    try{
        const result = await pool.query(
            `INSERT INTO links(code , original_url)
             VALUES ($1 , $2)
            RETURNING 
              id,
              code,
              original_url AS url,
              click_count AS clicks,
              last_clicked_at AS "lastClicked",
              created_at `,
             [finalcode,url]
        );
        return res.status(201).json(result.rows[0]);
    }catch(e){
        if(e.code==="23505"){
          
             return res.status(409).json({ error: "Code already exists. Try another." });
        }
         return res.status(500).json({ error: "Server error" });
    }

}) 


//Get api link 
app.get("/api/links" , async (req,res) => {

    const result = await pool.query(
        `SELECT id,
      code,
      original_url AS url,
      click_count AS clicks,
      last_clicked_at AS "lastClicked",
      created_at 
       FROM links ORDER BY created_at DESC`
    ); 
   
    res.json(result.rows)
}) 

//Get api link using code 
app.get("/api/links/:code" , async (req,res) => {
   const{code} = req.params; 
   console.log("SERVER STARTED FROM THIS FILE");

   console.log("Fetching link for code:", code);
   const result = await pool.query(
        `SELECT * FROM links WHERE code=$1`,[code]
   ) 
   console.log(result) 

    if (result.rows.length === 0) {
    return res.status(404).json({ error: "Code not found" });
  }

   return res.json(result.rows[0]);
})  

//Delete the Link 
app.delete("/api/links/:code" , async (req,res) => {
   const{code} = req.params; 
   console.log("DELETE HIT FOR:", code);

   const result = await pool.query(
        `DELETE FROM links WHERE code=$1`,[code]
   ) 
   
    console.log("ROW COUNT:", result.rowCount);

    if (result.rowCount === 0) {
    return res.status(404).json({ error: "Code not found" });
  }

 return  res.json({ok:true,
                   msg : "Deleted Successfully" 
   })
})  

// Redirect Route

app.get("/:code", async (req, res) => {
  const { code } = req.params;
  console.log("REDIRECT ROUTE HIT WITH CODE:", code);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT * FROM links WHERE code=$1 FOR UPDATE`,
      [code]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Not found");
    }

    const link = result.rows[0];

    // Update click count + last clicked time
    await client.query(
      `UPDATE links 
       SET click_count = click_count + 1,
           last_clicked_at = NOW()
       WHERE id = $1`,
      [link.id]
    );

    await client.query("COMMIT");

    return res.redirect(link.original_url);

  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

app.listen(PORT, "0.0.0.0", () => console.log("Server Running on:", PORT))

