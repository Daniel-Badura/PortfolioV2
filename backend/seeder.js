import projects from "./data/projects.js";
import Project from "./models/projectModel.js";
import connectDB from "./config/db.js";

connectDB();

const importData = async () => {
  try {
    await Project.deleteMany();
    await Project.insertMany(projects);
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const removeData = async () => {
  try {
    await Project.deleteMany();
    console.log("Data successfully removed!".red.inverse);
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  removeData();
} else {
  importData();
}
