import { Component, signal } from '@angular/core';
import { HlmFileUploadComponent } from '@spartan-ng/helm/file-upload';
import type { FileUploadFile, FileUploadValidation } from '@spartan-ng/brain/file-upload';

@Component({
	selector: 'spartan-file-upload-preview',
	imports: [HlmFileUploadComponent],
	template: `
		<div class="space-y-8">
			<div>
				<h3 class="mb-4 text-lg font-semibold">Basic File Upload</h3>
				<hlm-file-upload
					[multiple]="true"
					[validation]="basicValidation()"
					(filesChanged)="onFilesChanged($event)"
				/>
			</div>

			<div>
				<h3 class="mb-4 text-lg font-semibold">Image Upload with Custom Content</h3>
				<hlm-file-upload
					variant="outline"
					size="lg"
					[multiple]="true"
					[validation]="imageValidation()"
				>
					<div slot="icon" class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
						<svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
						</svg>
					</div>
					<div slot="title">
						<h4 class="text-lg font-semibold">Upload Images</h4>
					</div>
					<div slot="description">
						<p class="text-sm text-muted-foreground">
							Drag and drop your images here, or click to browse.
							<br />
							Supports PNG, JPG, GIF up to 5MB each.
						</p>
					</div>
				</hlm-file-upload>
			</div>

			<div>
				<h3 class="mb-4 text-lg font-semibold">Single File Upload (Compact)</h3>
				<hlm-file-upload
					variant="ghost"
					size="sm"
					[multiple]="false"
					[validation]="documentValidation()"
				/>
			</div>
		</div>
	`,
})
export class FileUploadPreview {
	protected readonly basicValidation = signal<FileUploadValidation>({
		maxSize: 10 * 1024 * 1024, // 10MB
		maxFiles: 5,
	});

	protected readonly imageValidation = signal<FileUploadValidation>({
		maxSize: 5 * 1024 * 1024, // 5MB
		maxFiles: 3,
		acceptedTypes: ['image/*'],
	});

	protected readonly documentValidation = signal<FileUploadValidation>({
		maxSize: 2 * 1024 * 1024, // 2MB
		acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'],
	});

	protected onFilesChanged(files: FileUploadFile[]): void {
		console.log('Files changed:', files);
	}
}

export const defaultImports = `
import { HlmFileUploadComponent } from '@spartan-ng/helm/file-upload';
import type { FileUploadFile, FileUploadValidation } from '@spartan-ng/brain/file-upload';
`;

export const defaultSkeleton = `
<hlm-file-upload
	[multiple]="true"
	[validation]="validation"
	(filesChanged)="onFilesChanged($event)"
/>
`;
