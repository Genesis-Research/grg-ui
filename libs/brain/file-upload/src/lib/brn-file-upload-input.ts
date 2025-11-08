import type { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	input,
	output,
	viewChild,
} from '@angular/core';

@Component({
	selector: 'brn-file-upload-input',
	template: `
		<input
			#fileInput
			type="file"
			[multiple]="multiple()"
			[accept]="accept()"
			[disabled]="disabled()"
			(change)="_onFileChange($event)"
			style="display: none;"
		/>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[attr.data-disabled]': 'disabled() || null',
	},
})
export class BrnFileUploadInput {
	private readonly _fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

	// Inputs
	public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly accept = input<string>('');

	// Outputs
	public readonly filesSelected = output<File[]>();

	// Public methods
	public openFileDialog(): void {
		if (this.disabled()) return;

		const input = this._fileInput().nativeElement;
		input.click();
	}

	public clearSelection(): void {
		const input = this._fileInput().nativeElement;
		input.value = '';
	}

	// Event handlers
	protected _onFileChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		const files = input.files;

		if (files && files.length > 0) {
			const fileArray = Array.from(files);
			this.filesSelected.emit(fileArray);
		}

		// Clear the input so the same file can be selected again
		input.value = '';
	}
}
