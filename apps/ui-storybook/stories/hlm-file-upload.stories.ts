import { HlmFileUploadComponent } from '@spartan-ng/helm/file-upload';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

export default {
	title: 'File Upload',
	component: HlmFileUploadComponent,
	tags: ['autodocs'],
	decorators: [
		moduleMetadata({
			imports: [HlmFileUploadComponent],
		}),
	],
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['default', 'outline', 'ghost'],
		},
		size: {
			control: { type: 'select' },
			options: ['sm', 'default', 'lg'],
		},
		disabled: {
			control: { type: 'boolean' },
		},
		multiple: {
			control: { type: 'boolean' },
		},
	},
} as Meta<HlmFileUploadComponent>;

type Story = StoryObj<HlmFileUploadComponent>;

export const Default: Story = {
	args: {
		variant: 'default',
		size: 'default',
		disabled: false,
		multiple: false,
	},
	render: (args) => ({
		props: args,
		template: `
			<hlm-file-upload
				[variant]="variant"
				[size]="size"
				[disabled]="disabled"
				[multiple]="multiple"
			/>
		`,
	}),
};

export const MultipleFiles: Story = {
	args: {
		variant: 'default',
		size: 'default',
		disabled: false,
		multiple: true,
	},
	render: (args) => ({
		props: args,
		template: `
			<hlm-file-upload
				[variant]="variant"
				[size]="size"
				[disabled]="disabled"
				[multiple]="multiple"
			/>
		`,
	}),
};

export const WithValidation: Story = {
	args: {
		variant: 'default',
		size: 'default',
		disabled: false,
		multiple: true,
		validation: {
			maxSize: 5 * 1024 * 1024, // 5MB
			maxFiles: 3,
			acceptedTypes: ['image/*', '.pdf', '.doc', '.docx'],
		},
	},
	render: (args) => ({
		props: args,
		template: `
			<hlm-file-upload
				[variant]="variant"
				[size]="size"
				[disabled]="disabled"
				[multiple]="multiple"
				[validation]="validation"
			/>
		`,
	}),
};

export const ImageOnly: Story = {
	args: {
		variant: 'default',
		size: 'default',
		disabled: false,
		multiple: true,
		validation: {
			maxSize: 10 * 1024 * 1024, // 10MB
			acceptedTypes: ['image/*'],
		},
	},
	render: (args) => ({
		props: args,
		template: `
			<hlm-file-upload
				[variant]="variant"
				[size]="size"
				[disabled]="disabled"
				[multiple]="multiple"
				[validation]="validation"
			>
				<div slot="icon" class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
					<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
					</svg>
				</div>
				<p slot="title" class="text-sm font-medium">Upload your images</p>
				<p slot="description" class="text-xs text-muted-foreground">
					PNG, JPG, GIF up to 10MB each
				</p>
			</hlm-file-upload>
		`,
	}),
};

export const CustomContent: Story = {
	args: {
		variant: 'outline',
		size: 'lg',
		disabled: false,
		multiple: false,
	},
	render: (args) => ({
		props: args,
		template: `
			<hlm-file-upload
				[variant]="variant"
				[size]="size"
				[disabled]="disabled"
				[multiple]="multiple"
			>
				<div slot="icon" class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
					<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
					</svg>
				</div>
				<div slot="title">
					<h3 class="text-lg font-semibold">Upload Document</h3>
				</div>
				<div slot="description">
					<p class="text-sm text-muted-foreground">
						Choose a file to upload. Supported formats include PDF, DOC, and TXT files.
					</p>
				</div>
				<button slot="action" type="button" class="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
					</svg>
					Choose File
				</button>
			</hlm-file-upload>
		`,
	}),
};

export const Variants: Story = {
	render: () => ({
		template: `
			<div class="space-y-8">
				<div>
					<h3 class="mb-4 text-lg font-semibold">Default</h3>
					<hlm-file-upload variant="default" />
				</div>
				
				<div>
					<h3 class="mb-4 text-lg font-semibold">Outline</h3>
					<hlm-file-upload variant="outline" />
				</div>
				
				<div>
					<h3 class="mb-4 text-lg font-semibold">Ghost</h3>
					<hlm-file-upload variant="ghost" />
				</div>
			</div>
		`,
	}),
};

export const Sizes: Story = {
	render: () => ({
		template: `
			<div class="space-y-8">
				<div>
					<h3 class="mb-4 text-lg font-semibold">Small</h3>
					<hlm-file-upload size="sm" />
				</div>
				
				<div>
					<h3 class="mb-4 text-lg font-semibold">Default</h3>
					<hlm-file-upload size="default" />
				</div>
				
				<div>
					<h3 class="mb-4 text-lg font-semibold">Large</h3>
					<hlm-file-upload size="lg" />
				</div>
			</div>
		`,
	}),
};

export const Disabled: Story = {
	args: {
		disabled: true,
		multiple: true,
	},
	render: (args) => ({
		props: args,
		template: `
			<hlm-file-upload
				[disabled]="disabled"
				[multiple]="multiple"
			/>
		`,
	}),
};
