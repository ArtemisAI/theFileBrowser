<template>
  <div class="card floating">
    <div class="card-title">
      <h2>{{ t("prompts.upload") }}</h2>
    </div>

    <div class="card-content">
      <p>{{ t("prompts.uploadMessage") }}</p>

      <div
        id="drop-zone"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        class="drop-area"
        :class="{ 'drag-over': isDragging }"
      >
        <p>{{ t("prompts.dragDropMessage") }}</p>
      </div>
    </div>

    <div class="card-action full">
      <div
        @click="uploadFile"
        @keypress.enter="uploadFile"
        class="action"
        id="focus-prompt"
        tabindex="1"
      >
        <i class="material-icons">insert_drive_file</i>
        <div class="title">{{ t("buttons.file") }}</div>
      </div>
      <div
        @click="uploadFolder"
        @keypress.enter="uploadFolder"
        class="action"
        tabindex="2"
      >
        <i class="material-icons">folder</i>
        <div class="title">{{ t("buttons.folder") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";

import * as upload from "@/utils/upload";
import { scanFiles } from "@/utils/upload"; // Added import for scanFiles

const { t } = useI18n();
const route = useRoute();

const fileStore = useFileStore();
const layoutStore = useLayoutStore();
const isDragging = ref(false); // For styling the drop zone

// TODO: this is a copy of the same function in FileListing.vue
const uploadInput = (event: Event) => {
  const files = (event.currentTarget as HTMLInputElement)?.files;
  if (files === null) return;

  const folder_upload = !!files[0].webkitRelativePath;

  const uploadFiles: UploadList = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = folder_upload ? file.webkitRelativePath : undefined;
    uploadFiles.push({
      file,
      name: file.name,
      size: file.size,
      isDir: false,
      fullPath,
    });
  }

  const path = route.path.endsWith("/") ? route.path : route.path + "/";
  const conflict = upload.checkConflict(uploadFiles, fileStore.req!.items);

  if (conflict) {
    layoutStore.showHover({
      prompt: "replace",
      action: (event: Event) => {
        event.preventDefault();
        layoutStore.closeHovers();
        upload.handleFiles(uploadFiles, path, false);
      },
      confirm: (event: Event) => {
        event.preventDefault();
        layoutStore.closeHovers();
        upload.handleFiles(uploadFiles, path, true);
      },
    });

    return;
  }

  upload.handleFiles(uploadFiles, path);
};

const processFiles = async (files: FileList | UploadList) => {
  let uploadFiles: UploadList;

  // If 'files' is a FileList (from input element), convert to UploadList
  // If 'files' is already an UploadList (from scanFiles), use it directly
  if (files instanceof FileList) {
    uploadFiles = [];
    const folder_upload = !!files[0].webkitRelativePath;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fullPath = folder_upload ? file.webkitRelativePath : undefined;
      uploadFiles.push({
        file,
        name: file.name,
        size: file.size,
        isDir: false, // This might need adjustment if scanFiles provides isDir for FileList items
        fullPath,
      });
    }
  } else {
    uploadFiles = files;
  }

  const path = route.path.endsWith("/") ? route.path : route.path + "/";
  const conflict = upload.checkConflict(uploadFiles, fileStore.req!.items);

  if (conflict) {
    layoutStore.showHover({
      prompt: "replace",
      action: (event: Event) => {
        event.preventDefault();
        layoutStore.closeHovers();
        upload.handleFiles(uploadFiles, path, false);
      },
      confirm: (event: Event) => {
        event.preventDefault();
        layoutStore.closeHovers();
        upload.handleFiles(uploadFiles, path, true);
      },
    });
    return;
  }

  upload.handleFiles(uploadFiles, path);
};

const handleDragEnter = (event: DragEvent) => {
  isDragging.value = true;
};

const handleDragOver = (event: DragEvent) => {
  // This is necessary to allow dropping
  event.preventDefault();
  isDragging.value = true; // Keep highlighting if dragging over
};

const handleDragLeave = (event: DragEvent) => {
  isDragging.value = false;
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer) {
    const droppedItems = await scanFiles(event.dataTransfer);
    // scanFiles returns Promise<UploadList | FileList>
    // processFiles will handle both cases
    processFiles(droppedItems);
  }
};

const openUpload = (isFolder: boolean) => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.webkitdirectory = isFolder;
  // TODO: call the function in FileListing.vue instead
  input.onchange = uploadInput;
  input.click();
};

const uploadFile = () => {
  openUpload(false);
};
const uploadFolder = () => {
  openUpload(true);
};
</script>

<style scoped>
.drop-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 15px;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.drop-area p {
  margin: 0;
  color: #666;
}

.drop-area.drag-over {
  background-color: #f0f0f0;
  border-color: #aaa;
}
</style>
