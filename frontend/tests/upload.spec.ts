import { expect, test, AuthPage } from "./fixtures/auth";
import { Toast } from "./fixtures/toast";

test.describe("File Upload", () => {
  test("should successfully upload a new file via input", async ({
    authPage,
    page,
  }) => {
    const toast = new Toast(page);
    await page.goto("/files/");

    const uniqueFileName = `test-upload-${Date.now()}.txt`;
    const fileContent = Buffer.from("Test content for upload spec");

    // Use the hidden file input for direct upload
    await page.setInputFiles("#upload-input", {
      name: uniqueFileName,
      mimeType: "text/plain",
      buffer: fileContent,
    });

    // Wait for success toast
    await toast.isSuccess();

    // Assert that the file is visible in the listing
    // The selector targets an item in the file listing by its text content (name)
    // It might be inside a link or a span within the item structure
    await expect(
      page.locator(`.item .name:has-text("${uniqueFileName}")`)
    ).toBeVisible();
  });

  test("should show replace prompt when uploading a duplicate file", async ({
    authPage,
    page,
  }) => {
    const toast = new Toast(page);
    await page.goto("/files/");

    const duplicateFileName = `duplicate-test-${Date.now()}.txt`;
    const fileContent = Buffer.from("Test content for duplicate upload spec");

    // First upload
    await page.setInputFiles("#upload-input", {
      name: duplicateFileName,
      mimeType: "text/plain",
      buffer: fileContent,
    });
    await toast.isSuccess(); // Ensure first upload succeeded
    // Wait for the file to appear to avoid race conditions with the second upload
    await expect(
      page.locator(`.item .name:has-text("${duplicateFileName}")`)
    ).toBeVisible();

    // Attempt to upload the same file again
    await page.setInputFiles("#upload-input", {
      name: duplicateFileName,
      mimeType: "text/plain",
      buffer: fileContent,
    });

    // Assert that the replace prompt is visible
    // The prompt text is "One of the files you're trying to upload has a conflicting name."
    // This text is part of the 'prompts.replaceMessage' i18n key.
    // We look for a dialog or card containing this text.
    await expect(
      page.locator(".card-content p:has-text('One of the files you\\'re trying to upload has a conflicting name.')")
    ).toBeVisible();

    // Optional: Check for the "Replace" and "Skip" (or similar) buttons in the prompt
    await expect(
      page.locator(".card-action button:has-text('Replace')")
    ).toBeVisible();
    // The "action" in Upload.vue for skip is not a button but a div, let's adjust.
    // It's a div with class 'action' and text 'Skip this file' or similar based on i18n
    // The i18n key for the skip action in the prompt is not directly visible in the provided Upload.vue
    // but typically prompts have a confirm and a cancel/action.
    // The `upload.checkConflict` leads to `layoutStore.showHover({ prompt: "replace", action: ..., confirm: ... })`
    // The `action` is the "skip" (default) and `confirm` is "replace".
    // The `action` in the prompt is usually the non-highlighted one.
    // In `Upload.vue` the prompt has buttons for "Replace" and an action for "Skip".
    // The "action" element in the conflict prompt in `Upload.vue` is not a button.
    // It's a div with class "action" that calls `layoutStore.closeHovers()` and `upload.handleFiles(uploadFiles, path, false);`
    // Let's assume the prompt structure has distinct buttons or actions.
    // The prompt shown via layoutStore.showHover usually has a confirm button.
    // The 'replace' prompt in `Upload.vue` has:
    // action: (event: Event) => { layoutStore.closeHovers(); upload.handleFiles(uploadFiles, path, false); } (This is effectively "Skip")
    // confirm: (event: Event) => { layoutStore.closeHovers(); upload.handleFiles(uploadFiles, path, true); } (This is "Replace")
    // The default prompt template might render these as buttons.
    // Let's assume the "confirm" maps to a button with text "Replace" and "action" to "Skip" or "Cancel".
    // Based on `prompts.replace` and `buttons.replace`
    // The prompt's title is "Replace" (t("prompts.replace"))
    // The confirm button is "Replace" (t("buttons.replace"))
    // The action (skip) button might be "Cancel" or a specific "Skip" text.
    // Let's look for the "Replace" button specifically, as its text is more certain.
    await expect(page.getByRole('button', { name: 'Replace' })).toBeVisible();
  });
});
