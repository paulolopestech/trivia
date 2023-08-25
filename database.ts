const { Sequelize, DataTypes } = require("sequelize");
import * as fs from "fs";
import csv from "csv-parser";

export class DataBaseSqlClient {
  static database: any;
  static questionsTable: any;

  static async createQuestionsTable(): Promise<void> {
    this.questionsTable = this.database.define("questions", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      question: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alternatives: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    });

    await this.questionsTable.sync();
  }

  static async insertQuestion(data: any) {
    await this.database.sync();
    const insertedData = await this.questionsTable.create({ ...data });
  }

  static async insertMultipleQuestions(data: any) {
    await this.database.sync();
    const insertMultipleData = await this.questionsTable.bulkCreate(data);
  }

  static async getAllquestions() {
    await this.database.sync();
    const getExample = await this.questionsTable.findAll();
  }

  static async getQuestion() {
    await this.database.sync();
    const getExample = await this.questionsTable.findOne({
      order: Sequelize.random(),
    });
    console.log("GET EX:", getExample);
    return getExample;
  }

  static async initDataBase() {
    try {
      this.database = new Sequelize("dbName", "dbUser", "dbPassword", {
        dialect: "sqlite",
        storage: "db.sqlite",
      });
      await this.database.authenticate();
      await this.createQuestionsTable();
      return this.database;
    } catch (e) {
      console.log("ERROR", e);
      return { error: `Database connection error, ${e}`, statusCode: 500 };
    }
  }
}

(async () => {
  await DataBaseSqlClient.initDataBase();
  await DataBaseSqlClient.createQuestionsTable();

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
    .on("end", async () => {
      await DataBaseSqlClient.insertMultipleQuestions(results);
    });
})();
