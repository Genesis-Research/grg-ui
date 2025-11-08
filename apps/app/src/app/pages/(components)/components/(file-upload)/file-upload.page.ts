import type { RouteMeta } from '@analogjs/router';
import { Component, computed, inject } from '@angular/core';
import { PrimitiveSnippetsService } from '@spartan-ng/app/app/core/services/primitive-snippets.service';
import { UIApiDocs } from '@spartan-ng/app/app/shared/layout/ui-docs-section/ui-docs-section';
import { Code } from '../../../../shared/code/code';
import { CodePreview } from '../../../../shared/code/code-preview';
import { MainSection } from '../../../../shared/layout/main-section';
import { PageBottomNavPlaceholder } from '../../../../shared/layout/page-bottom-nav-placeholder';
import { PageBottomNav } from '../../../../shared/layout/page-bottom-nav/page-bottom-nav';
import { PageBottomNavLink } from '../../../../shared/layout/page-bottom-nav/page-bottom-nav-link';
import { PageNav } from '../../../../shared/layout/page-nav/page-nav';
import { SectionIntro } from '../../../../shared/layout/section-intro';
import { SectionSubHeading } from '../../../../shared/layout/section-sub-heading';
import { Tabs } from '../../../../shared/layout/tabs';
import { TabsCli } from '../../../../shared/layout/tabs-cli';
import { metaWith } from '../../../../shared/meta/meta.util';
import { FileUploadPreview, defaultImports, defaultSkeleton } from './file-upload.preview';

export const routeMeta: RouteMeta = {
	data: { breadcrumb: 'file-upload', api: 'file-upload' },
	meta: metaWith('spartan/ui - file-upload', 'Styled file upload component with drag &amp; drop interface'),
	title: 'spartan/ui - file-upload',
};

@Component({
	selector: 'spartan-file-upload',
	imports: [
		MainSection,
		Code,
		SectionIntro,
		SectionSubHeading,
		Tabs,
		TabsCli,
		FileUploadPreview,
		CodePreview,
		PageNav,
		PageBottomNav,
		PageBottomNavLink,
		PageBottomNavPlaceholder,
		UIApiDocs,
	],
	template: `
		<section spartanMainSection>
			<spartan-section-intro name="file-upload" lead="Styled file upload component with drag &amp; drop interface" />

			<spartan-tabs firstTab="Preview" secondTab="Code">
				<div spartanCodePreview firstTab>
					<spartan-file-upload-preview />
				</div>
				<spartan-code secondTab [code]="_defaultCode()" />
			</spartan-tabs>

			<spartan-section-sub-heading id="installation">Installation</spartan-section-sub-heading>
			<spartan-cli-tabs
				class="mt-4"
				nxCode="npx nx g @spartan-ng/cli:ui file-upload"
				ngCode="ng g @spartan-ng/cli:ui file-upload"
			/>

			<spartan-section-sub-heading id="usage">Usage</spartan-section-sub-heading>
			<div class="space-y-4">
				<spartan-code [code]="_imports" />
				<spartan-code [code]="_codeSkeleton" />
			</div>

			<spartan-section-sub-heading id="brn-api">Brain API</spartan-section-sub-heading>
			<spartan-ui-api-docs docType="brain" />

			<spartan-section-sub-heading id="hlm-api">Helm API</spartan-section-sub-heading>
			<spartan-ui-api-docs docType="helm" />

			<spartan-page-bottom-nav>
				<spartan-page-bottom-nav-link href="form" label="Form" />
				<spartan-page-bottom-nav-link direction="previous" href="field" label="Field" />
			</spartan-page-bottom-nav>
		</section>
		<spartan-page-nav />
	`,
})
export default class FileUploadPage {
	private readonly _snippets = inject(PrimitiveSnippetsService).getSnippets('file-upload');
	protected readonly _defaultCode = computed(() => this._snippets()['default']);
	protected readonly _imports = defaultImports;
	protected readonly _codeSkeleton = defaultSkeleton;
}
