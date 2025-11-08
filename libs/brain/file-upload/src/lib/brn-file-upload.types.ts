export interface FileUploadFile {
	file: File;
	id: string;
	status: 'pending' | 'uploading' | 'success' | 'error';
	progress: number;
	error?: string;
	preview?: string;
}

export interface FileUploadValidation {
	maxSize?: number;
	maxFiles?: number;
	acceptedTypes?: string[];
	minFiles?: number;
}

export interface FileUploadError {
	type: 'file-too-large' | 'invalid-type' | 'too-many-files' | 'too-few-files' | 'upload-failed';
	message: string;
	file?: File;
}

export interface FileUploadState {
	files: FileUploadFile[];
	isDragOver: boolean;
	isUploading: boolean;
	errors: FileUploadError[];
}

export type FileUploadEventType = 
	| 'files-added'
	| 'files-removed'
	| 'file-progress'
	| 'upload-complete'
	| 'upload-error'
	| 'validation-error';

export interface FileUploadEvent {
	type: FileUploadEventType;
	files?: FileUploadFile[];
	file?: FileUploadFile;
	error?: FileUploadError;
}
