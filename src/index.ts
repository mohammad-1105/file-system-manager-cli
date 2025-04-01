import * as fs from "node:fs/promises";
import readline from "node:readline/promises";
import path from "node:path";
import chalk from "chalk";

// Utility Functions
const promptUser = async (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return await rl.question(chalk.green(question));
  } finally {
    rl.close();
  }
};

const handleFileOperation = async (
  operation: string,
  filePath: string,
  action: () => Promise<void>
): Promise<void> => {
  try {
    await action();
    console.log(chalk.green(`File ${operation} successful ✅`));
  } catch (error) {
    console.error(chalk.red(`Error: File ${operation} failed:`, error));
  }
};

const handleFolderOperation = async (
  operation: string,
  folderPath: string,
  action: () => Promise<void>
): Promise<void> => {
  try {
    await action();
    console.log(chalk.green(`Folder ${operation} successful ✅`));
  } catch (error) {
    console.error(chalk.red(`Error: Folder ${operation} failed:`, error));
  }
};

// File Operations
const createFile = async (
  filePath: string,
  content?: string
): Promise<void> => {
  await Bun.write(filePath, content || "");
};

const readFile = async (filePath: string): Promise<void> => {
  const fileContent = await fs.readFile(filePath, "utf-8");
  console.log(chalk.green("Fetched your file content ✅"));
  console.log(chalk.bgWhite.white(fileContent));
};

const deleteFile = async (filePath: string): Promise<void> => {
  await Bun.file(filePath).delete();
};

const writeFile = async (filePath: string, content: string): Promise<void> => {
  await fs.appendFile(filePath, content);
};

const createFolder = async (folderPath: string): Promise<void> => {
  await fs.mkdir(folderPath, { recursive: true });
};

const deleteFolder = async (folderPath: string): Promise<void> => {
  await fs.rm(folderPath, { recursive: true });
};

const listItems = async (listPath: string = "./") => {
  const items = await fs.readdir(listPath, { withFileTypes: true });

  return items.map((item) => {
    return {
      name: item.name,
      type: item.isDirectory() ? "folder" : "file",
      path: path.join(import.meta.dirname, item.name),
    };
  });
};

// Main Menu
const menu = async (): Promise<void> => {
  console.clear();

  const fileOptions: string[] = [
    "CREATE_FILE",
    "READ_FILE",
    "DELETE_FILE",
    "WRITE_FILE",
    "CREATE_FOLDER",
    "DELETE_FOLDER",
    "LIST_ITEMS",
    "EXIT",
  ];

  fileOptions.forEach((option, index) => {
    console.log(chalk.blue(`${index + 1} ${chalk.magenta(option)}`));
  });

  const answer = await promptUser("\nSelect an Option: ");

  switch (answer) {
    case "1": {
      const filePath = await promptUser("Enter the filepath: ");
      const wantContent = (
        await promptUser("Do you want initial content? (y/n): ")
      ).toLowerCase();
      let content = "";
      if (wantContent === "y") {
        content = await promptUser("Enter the content: ");
      }
      await handleFileOperation("creation", filePath, () =>
        createFile(filePath, content)
      );
      break;
    }
    case "2": {
      const filePath = await promptUser("Enter the filepath: ");
      await handleFileOperation("reading", filePath, () => readFile(filePath));
      break;
    }
    case "3": {
      const filePath = await promptUser("Enter the filepath: ");
      const confirmDelete = (
        await promptUser("Confirm delete? (y/n): ")
      ).toLowerCase();
      if (confirmDelete === "y") {
        await handleFileOperation("deletion", filePath, () =>
          deleteFile(filePath)
        );
      } else {
        console.log(chalk.blue("Action stopped."));
      }
      break;
    }
    case "4": {
      const filePath = await promptUser("Enter the filepath: ");
      const content = await promptUser("Enter the content: ");
      await handleFileOperation("writing", filePath, () =>
        writeFile(filePath, content)
      );
      break;
    }
    case "5": {
      const folderPath = await promptUser("Enter the folder path: ");
      await handleFolderOperation("creation", folderPath, () =>
        createFolder(folderPath)
      );
      break;
    }
    case "6": {
      const folderPath = await promptUser("Enter the folder path: ");
      const confirmDelete = (
        await promptUser("Confirm delete? (y/n): ")
      ).toLowerCase();
      if (confirmDelete === "y") {
        await handleFolderOperation("deletion", folderPath, () =>
          deleteFolder(folderPath)
        );
      } else {
        console.log(chalk.blue("Action stopped."));
      }
      break;
    }
    case "7":
      const listPath = await promptUser("Enter the list path: (current path) ");
      const items = await listItems(listPath || "./");

      items.forEach((item) => {
        const icon = item.type === "folder" ? "📁" : "📄";
        console.log(`${icon} ${item.name}`);
      });

      break;
    case "8":
      console.log(chalk.red("Exiting..."));
      return;
    default:
      console.log(chalk.red("Invalid option."));

      return;
  }

  await promptUser(chalk.gray("Press enter to continue..."));

  menu(); // Recursive call for continuous menu
};

menu();
