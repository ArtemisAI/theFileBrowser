import { test, expect, AuthPage } from "./fixtures/auth";
import type { Resource } from "@/types";

test.describe("File Library Listing", () => {
  test("should display mocked files and folders correctly", async ({
    authPage, // This fixture ensures the user is logged in
    page,
  }) => {
    const mockFileName = "test-file.txt";
    const mockFolderName = "Test Folder";
    const mockFileSize = 123;
    // For stable date formatting with .fromNow(), use a date slightly in the past
    const mockFileModifiedDate = new Date(
      Date.now() - 60 * 1000
    ).toISOString(); // 1 minute ago
    const mockFolderModifiedDate = new Date(
      Date.now() - 120 * 1000
    ).toISOString(); // 2 minutes ago

    const mockResourceData: Resource = {
      path: "/",
      name: "files",
      type: "text", // Type for the root, can be arbitrary for this test
      isDir: true,
      isSymlink: false,
      modified: new Date().toISOString(),
      mode: 493,
      size: 0,
      numFiles: 1,
      numDirs: 1,
      items: [
        {
          index: 0,
          name: mockFolderName,
          isDir: true,
          url: `/files/${encodeURIComponent(mockFolderName)}/`,
          modified: mockFolderModifiedDate,
          size: 0,
          type: "text", // Type for folder, can be arbitrary
          path: `/${mockFolderName}`,
          isSymlink: false,
          mode: 493,
        },
        {
          index: 1,
          name: mockFileName,
          isDir: false,
          url: `/files/${encodeURIComponent(mockFileName)}`,
          modified: mockFileModifiedDate,
          size: mockFileSize,
          type: "text",
          path: `/${mockFileName}`,
          isSymlink: false,
          mode: 493,
        },
      ],
      sorting: { by: "name", asc: false },
      commands: [],
      allowFrontmatter: false,
    };

    await page.route(/\/api\/resources(\/.*)?$/, async (route) => {
      await route.fulfill({ json: mockResourceData });
    });

    await page.goto("/files/");

    // Assertions for the folder
    const folderRow = page.locator(`.item[data-dir="true"]:has-text("${mockFolderName}")`);
    await expect(folderRow).toBeVisible();
    await expect(folderRow.locator(".name")).toHaveText(mockFolderName);
    await expect(folderRow.locator(".size")).toHaveText("—"); // Em-dash for folder size
    await expect(folderRow.locator(".modified time")).toHaveText("2 minutes ago");


    // Assertions for the file
    const fileRow = page.locator(`.item[data-dir="false"]:has-text("${mockFileName}")`);
    await expect(fileRow).toBeVisible();
    await expect(fileRow.locator(".name")).toHaveText(mockFileName);
    await expect(fileRow.locator(".size")).toHaveText("123 B");
    // dayjs().fromNow() for 1 minute ago should be "a minute ago" or "1 minute ago"
    // Let's make it more flexible for CI environments
     await expect(fileRow.locator(".modified time"))
       .toHaveText(/^(a|1) minute(s)? ago$/);
  });

  test("should display 'lonely' message for an empty directory", async ({
    authPage,
    page,
  }) => {
    const mockEmptyResourceData: Resource = {
      path: "/",
      name: "files",
      type: "text",
      isDir: true,
      isSymlink: false,
      modified: new Date().toISOString(),
      mode: 493,
      size: 0,
      numFiles: 0,
      numDirs: 0,
      items: [], // Empty items
      sorting: { by: "name", asc: false },
      commands: [],
      allowFrontmatter: false,
    };

    await page.route(/\/api\/resources(\/.*)?$/, async (route) => {
      await route.fulfill({ json: mockEmptyResourceData });
    });

    await page.goto("/files/");

    // Assert that the "It feels lonely here..." message is visible
    // The i18n key is files.lonely
    // The message is inside an h2 element with class "message"
    await expect(
      page.locator("h2.message:has-text('It feels lonely here...')")
    ).toBeVisible();
  });
});
