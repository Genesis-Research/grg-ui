import type { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	forwardRef,
	inject,
	input,
	output,
	signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ChangeFn, TouchFn } from '@spartan-ng/brain/forms';
import { BrnFormFieldControl } from '@spartan-ng/brain/form-field';
import type {
	FileUploadError,
	FileUploadEvent,
	FileUploadFile,
	FileUploadState,
	FileUploadValidation,
} from './brn-file-upload.types';

export const BRN_FILE_UPLOAD_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => BrnFileUpload),
	multi: true,
};

@Component({
	selector: 'brn-file-upload',
	template: `<ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [BRN_FILE_UPLOAD_VALUE_ACCESSOR],
	host: {
		'[attr.data-disabled]': 'disabled() || null',
		'[attr.data-drag-over]': '_state().isDragOver || null',
		'[attr.data-uploading]': '_state().isUploading || null',
		'[attr.data-has-files]': '_state().files.length > 0 || null',
		'[attr.data-has-errors]': '_state().errors.length > 0 || null',
	},
})
export class BrnFileUpload extends BrnFormFieldControl implements ControlValueAccessor {
	// Inputs
	public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly validation = input<FileUploadValidation>({});

	// Outputs
	public readonly filesChanged = output<FileUploadFile[]>();
	public readonly fileUploadEvent = output<FileUploadEvent>();

	// Internal state
	protected readonly _state = signal<FileUploadState>({
		files: [],
		isDragOver: false,
		isUploading: false,
		errors: [],
	});

	// Computed properties
	public readonly files = computed(() => this._state().files);
	public readonly isDragOver = computed(() => this._state().isDragOver);
	public readonly isUploading = computed(() => this._state().isUploading);
	public readonly errors = computed(() => this._state().errors);
	public readonly hasFiles = computed(() => this._state().files.length > 0);
	public readonly hasErrors = computed(() => this._state().errors.length > 0);

	// ControlValueAccessor implementation
	private _onChange: ChangeFn<FileUploadFile[]> = () => {};
	private _onTouched: TouchFn = () => {};

	writeValue(files: FileUploadFile[] | null): void {
		if (files) {
			this._updateState({ files });
		}
	}

	registerOnChange(fn: ChangeFn<FileUploadFile[]>): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: TouchFn): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		// Handled by the disabled input
	}

	// Public methods
	public addFiles(files: File[]): void {
		if (this.disabled()) return;

		const validationErrors = this._validateFiles(files);
		if (validationErrors.length > 0) {
			this._updateState({
				errors: [...this._state().errors, ...validationErrors],
			});
			validationErrors.forEach(error => {
				this.fileUploadEvent.emit({ type: 'validation-error', error });
			});
			return;
		}

		const newFiles = files.map(file => this._createFileUploadFile(file));
		const currentFiles = this._state().files;
		const updatedFiles = this.multiple() ? [...currentFiles, ...newFiles] : newFiles;

		this._updateState({ files: updatedFiles });
		this._onChange(updatedFiles);
		this.filesChanged.emit(updatedFiles);
		this.fileUploadEvent.emit({ type: 'files-added', files: newFiles });
		this._onTouched();
	}

	public removeFile(fileId: string): void {
		if (this.disabled()) return;

		const currentFiles = this._state().files;
		const updatedFiles = currentFiles.filter(f => f.id !== fileId);
		const removedFile = currentFiles.find(f => f.id === fileId);

		this._updateState({ files: updatedFiles });
		this._onChange(updatedFiles);
		this.filesChanged.emit(updatedFiles);
		
		if (removedFile) {
			this.fileUploadEvent.emit({ type: 'files-removed', files: [removedFile] });
		}
	}

	public clearFiles(): void {
		if (this.disabled()) return;

		this._updateState({ files: [], errors: [] });
		this._onChange([]);
		this.filesChanged.emit([]);
	}

	public setDragOver(isDragOver: boolean): void {
		this._updateState({ isDragOver });
	}

	public updateFileProgress(fileId: string, progress: number): void {
		const currentFiles = this._state().files;
		const updatedFiles = currentFiles.map(file =>
			file.id === fileId ? { ...file, progress, status: (progress === 100 ? 'success' : 'uploading') as FileUploadFile['status'] } : file
		);

		this._updateState({ files: updatedFiles });
		const updatedFile = updatedFiles.find(f => f.id === fileId);
		
		if (updatedFile) {
			this.fileUploadEvent.emit({ type: 'file-progress', file: updatedFile });
			if (progress === 100) {
				this.fileUploadEvent.emit({ type: 'upload-complete', file: updatedFile });
			}
		}
	}

	public setFileError(fileId: string, error: string): void {
		const currentFiles = this._state().files;
		const updatedFiles = currentFiles.map(file =>
			file.id === fileId ? { ...file, status: 'error' as FileUploadFile['status'], error } : file
		);

		this._updateState({ files: updatedFiles });
		const errorFile = updatedFiles.find(f => f.id === fileId);
		
		if (errorFile) {
			const uploadError: FileUploadError = {
				type: 'upload-failed',
				message: error,
				file: errorFile.file,
			};
			this.fileUploadEvent.emit({ type: 'upload-error', error: uploadError });
		}
	}

	public clearErrors(): void {
		this._updateState({ errors: [] });
	}

	// Private methods
	private _updateState(partialState: Partial<FileUploadState>): void {
		this._state.update(current => ({ ...current, ...partialState }));
	}

	private _createFileUploadFile(file: File): FileUploadFile {
		const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
		return {
			file,
			id,
			status: 'pending',
			progress: 0,
			preview: this._createPreview(file),
		};
	}

	private _createPreview(file: File): string | undefined {
		if (file.type.startsWith('image/')) {
			return URL.createObjectURL(file);
		}
		return undefined;
	}

	private _validateFiles(files: File[]): FileUploadError[] {
		const errors: FileUploadError[] = [];
		const validation = this.validation();
		const currentFileCount = this._state().files.length;

		// Check max files
		if (validation.maxFiles && currentFileCount + files.length > validation.maxFiles) {
			errors.push({
				type: 'too-many-files',
				message: `Maximum ${validation.maxFiles} files allowed`,
			});
		}

		// Check individual file constraints
		files.forEach(file => {
			// Check file size
			if (validation.maxSize && file.size > validation.maxSize) {
				errors.push({
					type: 'file-too-large',
					message: `File "${file.name}" is too large. Maximum size is ${this._formatFileSize(validation.maxSize)}`,
					file,
				});
			}

			// Check file type
			if (validation.acceptedTypes && validation.acceptedTypes.length > 0) {
				const isAccepted = validation.acceptedTypes.some(type => {
					if (type.startsWith('.')) {
						return file.name.toLowerCase().endsWith(type.toLowerCase());
					}
					return file.type.match(type.replace('*', '.*'));
				});

				if (!isAccepted) {
					errors.push({
						type: 'invalid-type',
						message: `File "${file.name}" has invalid type. Accepted types: ${validation.acceptedTypes.join(', ')}`,
						file,
					});
				}
			}
		});

		return errors;
	}

	private _formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
}
