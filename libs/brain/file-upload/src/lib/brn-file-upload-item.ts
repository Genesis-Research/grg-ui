import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	output,
} from '@angular/core';
import type { FileUploadFile } from './brn-file-upload.types';

@Component({
	selector: 'brn-file-upload-item',
	template: `<ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[attr.data-status]': 'file().status',
		'[attr.data-file-type]': '_fileType()',
		'[attr.data-has-preview]': 'file().preview ? true : null',
		'[attr.data-has-error]': 'file().error ? true : null',
		'[attr.role]': '"listitem"',
		'[attr.aria-label]': '_ariaLabel()',
	},
})
export class BrnFileUploadItem {
	// Inputs
	public readonly file = input.required<FileUploadFile>();

	// Outputs
	public readonly removeFile = output<string>();

	// Computed properties
	protected readonly _fileType = computed(() => {
		const file = this.file().file;
		if (file.type.startsWith('image/')) return 'image';
		if (file.type.startsWith('video/')) return 'video';
		if (file.type.startsWith('audio/')) return 'audio';
		if (file.type.includes('pdf')) return 'pdf';
		if (file.type.includes('text/') || file.type.includes('json')) return 'text';
		if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar')) return 'archive';
		return 'document';
	});

	protected readonly _ariaLabel = computed(() => {
		const file = this.file();
		const status = file.status;
		const fileName = file.file.name;
		const fileSize = this._formatFileSize(file.file.size);
		
		let label = `${fileName}, ${fileSize}`;
		
		switch (status) {
			case 'pending':
				label += ', ready to upload';
				break;
			case 'uploading':
				label += `, uploading ${file.progress}%`;
				break;
			case 'success':
				label += ', upload complete';
				break;
			case 'error':
				label += `, upload failed: ${file.error}`;
				break;
		}
		
		return label;
	});

	// Public methods
	public remove(): void {
		this.removeFile.emit(this.file().id);
	}

	public getFormattedSize(): string {
		return this._formatFileSize(this.file().file.size);
	}

	public getFileExtension(): string {
		const fileName = this.file().file.name;
		const lastDotIndex = fileName.lastIndexOf('.');
		return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1).toUpperCase() : '';
	}

	// Private methods
	private _formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
}
