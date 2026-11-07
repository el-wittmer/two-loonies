import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const baseURL = "https://v6.exchangerate-api.com/v6/";
const defaultBase = "USD"

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/", async (req, res) => {
    const url = baseURL + process.env.API_KEY + "/latest/" + defaultBase;
    const result = await axios.get(url);
    res.render("index.ejs", {conversionRates: result.data.conversion_rates});
})

app.get("/pair/:base/:target", async (req, res) => {
    try {
        const base = req.params.base;
        const target = req.params.target;
        const url = baseURL + process.env.API_KEY + "/pair/" + base + "/" + target;
        const result = await axios.get(url);
        res.render("index.ejs", {baseCode: result.data.base_code, targetCode: result.data.target_code, conversionRate: result.data.conversion_rate});
    }
    catch (error) {
        res.status(500);
    }

});

app.get("/submit", async (req, res) => {
    try {
        const base = req.query.base;
        const target = req.query.target;
        const amount = parseFloat(req.query.amount);
        if (isNaN(amount)) {
            console.log("Please enter a numerical amount.");
            res.render("index.ejs", {error: "error"});
        }
        else{
            const url = baseURL + process.env.API_KEY    + "/pair/" + base + "/" + target; 
            const result = await axios.get(url);
            res.render("index.ejs", {baseCode: result.data.base_code, targetCode: result.data.target_code, conversionRate: result.data.conversion_rate, baseAmount: Math.floor(amount * 100) / 100});
        }

    }
    catch (error) {
        res.status(500);
    }

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });