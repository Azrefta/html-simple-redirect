const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");

class GitHubBackup {
  constructor(username, token) {
    if (!username || !token) {
      throw new Error("GitHub username and token are required.");
    }

    this.username = username;
    this.octokit = new Octokit({ auth: token });
  }

  async ensureRepo(repoName) {
    try {
      const repos = await this.octokit.repos.listForAuthenticatedUser();
      const existingRepo = repos.data.find((repo) => repo.name === repoName);

      if (existingRepo) {
        console.log(`Repository "${repoName}" found.`);
        return repoName;
      }

      console.log(`Creating repository "${repoName}"...`);
      const newRepo = await this.octokit.repos.createForAuthenticatedUser({
        name: repoName,
        private: true,
      });

      console.log(`Repository "${repoName}" created.`);
      return newRepo.data.name;
    } catch (error) {
      console.error("Error ensuring repository:", error.message);
      throw error;
    }
  }

  async fetchFileMeta(repoName, remotePath) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.username,
        repo: repoName,
        path: remotePath,
      });

      const { sha, content } = response.data;
      return { sha, content: Buffer.from(content, "base64").toString("utf-8"), size: response.data.size };
    } catch (error) {
      if (error.status === 404) {
        return null; // File tidak ditemukan
      }
      console.error(`Failed to fetch metadata for "${remotePath}":`, error.message);
      throw error;
    }
  }

  async syncFile(repoName, localFilePath, baseDir) {
    try {
      if (!fs.existsSync(localFilePath)) {
        console.warn(`File "${localFilePath}" does not exist. Skipping.`);
        return;
      }

      const relativePath = path.relative(baseDir, localFilePath).replace(/\\/g, "/");
      const localFileContent = fs.readFileSync(localFilePath, "utf-8");
      const localFileSize = fs.statSync(localFilePath).size;

      console.log(`Checking "${relativePath}" in repository "${repoName}"...`);

      const remoteFile = await this.fetchFileMeta(repoName, relativePath);

      if (remoteFile) {
        if (remoteFile.size > localFileSize || remoteFile.content !== localFileContent) {
          console.log(`Remote file "${relativePath}" is larger or has different content. Updating local file...`);
          fs.writeFileSync(localFilePath, remoteFile.content, "utf-8");
          console.log(`Local file "${localFilePath}" updated from GitHub.`);
        } else {
          console.log(`File "${relativePath}" is up-to-date locally.`);
        }
      } else {
        console.log(`File "${relativePath}" not found in GitHub. Skipping.`);
      }
    } catch (error) {
      console.error(`Failed to sync "${localFilePath}":`, error.message);
    }
  }

  async uploadFileToRepo(repoName, localFilePath, baseDir) {
    try {
      if (!fs.existsSync(localFilePath)) {
        console.warn(`File "${localFilePath}" does not exist. Skipping.`);
        return;
      }

      const relativePath = path.relative(baseDir, localFilePath).replace(/\\/g, "/");
      const fileContent = fs.readFileSync(localFilePath, "utf-8");
      const localFileSize = fs.statSync(localFilePath).size;

      console.log(`Checking "${relativePath}" in repository "${repoName}"...`);

      const remoteFile = await this.fetchFileMeta(repoName, relativePath);

      if (remoteFile) {
        if (localFileSize > remoteFile.size || fileContent !== remoteFile.content) {
          console.log(`File content is different or local is larger. Updating "${relativePath}"...`);
          await this.octokit.repos.createOrUpdateFileContents({
            owner: this.username,
            repo: repoName,
            path: relativePath,
            message: `Backup: Updating ${relativePath}`,
            content: Buffer.from(fileContent).toString("base64"),
            sha: remoteFile.sha,
          });
          console.log(`Successfully updated "${relativePath}" in repository "${repoName}".`);
        } else {
          console.log(`File "${relativePath}" is the same on both GitHub and local. Skipping upload.`);
        }
      } else {
        console.log(`Uploading new file "${relativePath}" to repository "${repoName}"...`);
        await this.octokit.repos.createOrUpdateFileContents({
          owner: this.username,
          repo: repoName,
          path: relativePath,
          message: `Backup: Uploading ${relativePath}`,
          content: Buffer.from(fileContent).toString("base64"),
        });
        console.log(`Successfully uploaded "${relativePath}" to repository "${repoName}".`);
      }
    } catch (error) {
      console.error(`Failed to upload "${localFilePath}":`, error.message);
    }
  }

  async startBackup(filePaths, repoName, baseDir) {
    try {
      const repo = await this.ensureRepo(repoName);
      while (true) {
        console.log("Starting backup process...");
        for (const filePath of filePaths) {
          await this.syncFile(repo, filePath, baseDir);
          await this.uploadFileToRepo(repo, filePath, baseDir);
        }
        console.log("Backup complete. Waiting 1 hour before next backup...");
        await new Promise((resolve) => setTimeout(resolve, 3600000)); // 1 jam
      }
    } catch (error) {
      console.error("Backup process terminated:", error.message);
    }
  }
}
