import {
	ChangeDetectionStrategy,
	Component,
	input,
} from '@angular/core';
import type { FileUploadFile } from './brn-file-upload.types';

@Component({
	selector: 'brn-file-upload-list',
	template: `<ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[attr.data-empty]': 'files().length === 0 || null',
		'[attr.data-count]': 'files().length',
		'[attr.role]': '"list"',
		'[attr.aria-label]': '"Uploaded files"',
	},
})
export class BrnFileUploadList {
	// Inputs
	public readonly files = input.required<FileUploadFile[]>();
}
