import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	output,
	signal,
	viewChild,
} from '@angular/core';
import {
	BrnFileUpload,
	BrnFileUploadDropZone,
	BrnFileUploadInput,
	BrnFileUploadItem,
	BrnFileUploadList,
	type FileUploadFile,
	type FileUploadValidation,
} from '@spartan-ng/brain/file-upload';
import { hlm } from '@spartan-ng/helm/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const fileUploadVariants = cva(
	'relative w-full rounded-lg border-2 border-dashed transition-colors',
	{
		variants: {
			variant: {
				default: 'border-border bg-background hover:bg-accent/50',
				outline: 'border-input bg-background hover:border-ring',
				ghost: 'border-transparent bg-background hover:border-border',
			},
			size: {
				default: 'p-6',
				sm: 'p-4',
				lg: 'p-8',
			},
			state: {
				default: '',
				'drag-over': 'border-primary bg-primary/5',
				disabled: 'opacity-50 cursor-not-allowed',
				error: 'border-destructive bg-destructive/5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			state: 'default',
		},
	}
);

export const fileUploadContentVariants = cva(
	'flex flex-col items-center justify-center gap-4 text-center',
	{
		variants: {
			size: {
				default: 'min-h-[200px]',
				sm: 'min-h-[150px]',
				lg: 'min-h-[250px]',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	}
);

export const fileUploadListVariants = cva(
	'mt-4 space-y-2',
	{
		variants: {
			variant: {
				default: '',
				compact: 'space-y-1',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

export const fileUploadItemVariants = cva(
	'flex items-center gap-3 rounded-md border p-3 transition-colors',
	{
		variants: {
			variant: {
				default: 'border-border bg-background',
				outline: 'border-input bg-background hover:bg-accent/50',
			},
			status: {
				pending: '',
				uploading: 'border-primary/50 bg-primary/5',
				success: 'border-green-500/50 bg-green-500/5',
				error: 'border-destructive/50 bg-destructive/5',
			},
		},
		defaultVariants: {
			variant: 'default',
			status: 'pending',
		},
	}
);

export type FileUploadVariants = VariantProps<typeof fileUploadVariants>;

@Component({
	selector: 'hlm-file-upload',
	imports: [
		BrnFileUpload,
		BrnFileUploadDropZone,
		BrnFileUploadInput,
		BrnFileUploadList,
		BrnFileUploadItem,
	],
	template: `
		<brn-file-upload
			[disabled]="disabled()"
			[multiple]="multiple()"
			[validation]="validation()"
			(filesChanged)="filesChanged.emit($event)"
			(fileUploadEvent)="fileUploadEvent.emit($event)"
		>
			<brn-file-upload-drop-zone
				[class]="_computedClass()"
				(filesDropped)="onFilesDropped($event)"
				(dragOver)="onDragOver($event)"
				(clicked)="openFileDialog()"
			>
				<div [class]="_computedContentClass()">
					<ng-content select="[slot=icon]">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<svg
								class="h-6 w-6 text-muted-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
						</div>
					</ng-content>

					<div class="space-y-2">
						<ng-content select="[slot=title]">
							<p class="text-sm font-medium">
								{{ multiple() ? 'Drop files here or click to browse' : 'Drop file here or click to browse' }}
							</p>
						</ng-content>

						<ng-content select="[slot=description]">
							<p class="text-xs text-muted-foreground">
								@if (validation().acceptedTypes?.length) {
									Accepted formats: {{ validation().acceptedTypes?.join(', ') }}
								}
								@if (validation().maxSize) {
									<br />
									Maximum file size: {{ formatFileSize(validation().maxSize!) }}
								}
							</p>
						</ng-content>
					</div>

					<ng-content select="[slot=action]">
						<button
							type="button"
							class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							[disabled]="disabled()"
							(click)="openFileDialog()"
						>
							Browse Files
						</button>
					</ng-content>
				</div>
			</brn-file-upload-drop-zone>

			<brn-file-upload-input
				#fileInput
				[disabled]="disabled()"
				[multiple]="multiple()"
				[accept]="acceptString()"
				(filesSelected)="onFilesSelected($event)"
			/>

			@if (files().length > 0) {
				<brn-file-upload-list [files]="files()" [class]="_computedListClass()">
					@for (file of files(); track file.id) {
						<brn-file-upload-item
							[file]="file"
							[class]="_computedItemClass(file.status)"
							(removeFile)="onRemoveFile($event)"
						>
							<div class="flex min-w-0 flex-1 items-center gap-3">
								@if (file.preview) {
									<img
										[src]="file.preview"
										[alt]="file.file.name"
										class="h-10 w-10 rounded object-cover"
									/>
								} @else {
									<div class="flex h-10 w-10 items-center justify-center rounded bg-muted">
										<span class="text-xs font-medium text-muted-foreground">
											{{ getFileExtension(file.file.name) }}
										</span>
									</div>
								}

								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium">{{ file.file.name }}</p>
									<p class="text-xs text-muted-foreground">{{ formatFileSize(file.file.size) }}</p>
									
									@if (file.status === 'uploading') {
										<div class="mt-1 h-1.5 w-full rounded-full bg-muted">
											<div
												class="h-full rounded-full bg-primary transition-all"
												[style.width.%]="file.progress"
											></div>
										</div>
									}
									
									@if (file.error) {
										<p class="mt-1 text-xs text-destructive">{{ file.error }}</p>
									}
								</div>
							</div>

							<div class="flex items-center gap-2">
								@switch (file.status) {
									@case ('pending') {
										<span class="text-xs text-muted-foreground">Ready</span>
									}
									@case ('uploading') {
										<span class="text-xs text-primary">{{ file.progress }}%</span>
									}
									@case ('success') {
										<svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
									}
									@case ('error') {
										<svg class="h-4 w-4 text-destructive" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									}
								}

								<button
									type="button"
									class="flex h-6 w-6 items-center justify-center rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
									[disabled]="disabled()"
									(click)="onRemoveFile(file.id)"
									[attr.aria-label]="'Remove ' + file.file.name"
								>
									<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
							</div>
						</brn-file-upload-item>
					}
				</brn-file-upload-list>
			}
		</brn-file-upload>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmFileUploadComponent {
	private readonly _fileInput = viewChild<BrnFileUploadInput>('fileInput');
	private readonly _fileUpload = viewChild<BrnFileUpload>(BrnFileUpload);

	// Inputs
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly variant = input<FileUploadVariants['variant']>('default');
	public readonly size = input<FileUploadVariants['size']>('default');
	public readonly disabled = input<boolean>(false);
	public readonly multiple = input<boolean>(false);
	public readonly validation = input<FileUploadValidation>({});

	// Outputs
	public readonly filesChanged = output<FileUploadFile[]>();
	public readonly fileUploadEvent = output<any>();

	// Internal state
	private readonly _isDragOver = signal(false);

	// Computed properties
	public readonly files = computed(() => this._fileUpload()?.files() || []);

	protected readonly _computedClass = computed(() => {
		const state = this.disabled() ? 'disabled' : this._isDragOver() ? 'drag-over' : 'default';
		return hlm(
			fileUploadVariants({
				variant: this.variant(),
				size: this.size(),
				state: state as any,
			}),
			this.userClass()
		);
	});

	protected readonly _computedContentClass = computed(() =>
		hlm(fileUploadContentVariants({ size: this.size() }))
	);

	protected readonly _computedListClass = computed(() =>
		hlm(fileUploadListVariants({ variant: 'default' }))
	);

	protected _computedItemClass(status: FileUploadFile['status']): string {
		return hlm(fileUploadItemVariants({ variant: 'default', status }));
	}

	protected readonly acceptString = computed(() => {
		const acceptedTypes = this.validation().acceptedTypes;
		return acceptedTypes?.join(',') || '';
	});

	// Event handlers
	protected onFilesDropped(files: File[]): void {
		this._fileUpload()?.addFiles(files);
	}

	protected onFilesSelected(files: File[]): void {
		this._fileUpload()?.addFiles(files);
	}

	protected onDragOver(isDragOver: boolean): void {
		this._isDragOver.set(isDragOver);
		this._fileUpload()?.setDragOver(isDragOver);
	}

	protected onRemoveFile(fileId: string): void {
		this._fileUpload()?.removeFile(fileId);
	}

	protected openFileDialog(): void {
		this._fileInput()?.openFileDialog();
	}

	// Utility methods
	protected formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	protected getFileExtension(fileName: string): string {
		const lastDotIndex = fileName.lastIndexOf('.');
		return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1).toUpperCase() : 'FILE';
	}

	// Public API
	public clearFiles(): void {
		this._fileUpload()?.clearFiles();
	}

	public updateFileProgress(fileId: string, progress: number): void {
		this._fileUpload()?.updateFileProgress(fileId, progress);
	}

	public setFileError(fileId: string, error: string): void {
		this._fileUpload()?.setFileError(fileId, error);
	}
}
