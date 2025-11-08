import type { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	input,
	output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
	selector: 'brn-file-upload-drop-zone',
	template: `<ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[attr.data-disabled]': 'disabled() || null',
		'[attr.data-drag-over]': '_isDragOver || null',
		'(dragenter)': '_onDragEnter($event)',
		'(dragover)': '_onDragOver($event)',
		'(dragleave)': '_onDragLeave($event)',
		'(drop)': '_onDrop($event)',
		'[attr.tabindex]': 'disabled() ? -1 : 0',
		'[attr.role]': '"button"',
		'[attr.aria-label]': 'ariaLabel() || "Drop files here or click to select"',
		'(keydown.enter)': '_onKeyboardActivate($event)',
		'(keydown.space)': '_onKeyboardActivate($event)',
	},
})
export class BrnFileUploadDropZone {
	private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

	// Inputs
	public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly ariaLabel = input<string>();

	// Outputs
	public readonly filesDropped = output<File[]>();
	public readonly dragOver = output<boolean>();
	public readonly clicked = output<void>();

	// Internal state
	protected _isDragOver = false;
	private _dragCounter = 0;

	constructor() {
		// Set up drag and drop event listeners
		this._setupDragAndDropListeners();
	}

	private _setupDragAndDropListeners(): void {
		const element = this._elementRef.nativeElement;

		// Prevent default drag behaviors on the document
		merge(
			fromEvent<DragEvent>(document, 'dragenter'),
			fromEvent<DragEvent>(document, 'dragover'),
			fromEvent<DragEvent>(document, 'dragleave'),
			fromEvent<DragEvent>(document, 'drop')
		)
			.pipe(takeUntilDestroyed())
			.subscribe(event => {
				event.preventDefault();
			});

		// Handle click events
		fromEvent<MouseEvent>(element, 'click')
			.pipe(
				filter(() => !this.disabled()),
				takeUntilDestroyed()
			)
			.subscribe(() => {
				this.clicked.emit();
			});
	}

	protected _onDragEnter(event: DragEvent): void {
		if (this.disabled()) return;

		event.preventDefault();
		event.stopPropagation();

		this._dragCounter++;

		if (this._hasFiles(event)) {
			this._setDragOver(true);
		}
	}

	protected _onDragOver(event: DragEvent): void {
		if (this.disabled()) return;

		event.preventDefault();
		event.stopPropagation();

		if (this._hasFiles(event)) {
			// Set the dropEffect to show the appropriate cursor
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'copy';
			}
		}
	}

	protected _onDragLeave(event: DragEvent): void {
		if (this.disabled()) return;

		event.preventDefault();
		event.stopPropagation();

		this._dragCounter--;

		if (this._dragCounter === 0) {
			this._setDragOver(false);
		}
	}

	protected _onDrop(event: DragEvent): void {
		if (this.disabled()) return;

		event.preventDefault();
		event.stopPropagation();

		this._dragCounter = 0;
		this._setDragOver(false);

		const files = this._getFilesFromEvent(event);
		if (files.length > 0) {
			this.filesDropped.emit(files);
		}
	}

	protected _onKeyboardActivate(event: KeyboardEvent): void {
		if (this.disabled()) return;

		event.preventDefault();
		this.clicked.emit();
	}

	private _hasFiles(event: DragEvent): boolean {
		if (!event.dataTransfer) return false;

		// Check if the drag contains files
		return Array.from(event.dataTransfer.types).includes('Files');
	}

	private _getFilesFromEvent(event: DragEvent): File[] {
		if (!event.dataTransfer) return [];

		const files: File[] = [];

		// Handle both files and directory traversal
		if (event.dataTransfer.files) {
			for (let i = 0; i < event.dataTransfer.files.length; i++) {
				const file = event.dataTransfer.files[i];
				if (file) {
					files.push(file);
				}
			}
		}

		return files;
	}

	private _setDragOver(isDragOver: boolean): void {
		if (this._isDragOver !== isDragOver) {
			this._isDragOver = isDragOver;
			this.dragOver.emit(isDragOver);
		}
	}
}
