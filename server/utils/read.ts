import * as fs from "fs";
import csv from "csv-parser";

const results: any = [];

fs.createReadStream("./dataset/dataset.csv")
  .pipe(csv())
  .on("data", (row: any) => {
    const jsonString = row.choices
      .replace(/'/g, '"')
      .replace(/array\(/g, "[")
      .replace(/dtype=object\)/g, "]")
      .replace(/\],\s+/g, "], ")
      .replace(/,\s+\]/g, "]");
    const jsonObject = JSON.parse(jsonString);
    for (const key in jsonObject) {
      if (Array.isArray(jsonObject[key][0])) {
        jsonObject[key] = jsonObject[key][0];
      }
    }
    const register = {
      answer: row.answerKey,
      question: row.question,
      alternatives: jsonObject.text,
    };
    results.push(register);
  })
  .on("end", () => {
    console.log(results.length);
  });
