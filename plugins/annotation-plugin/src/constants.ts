/**
 * Annotation plugin constants
 */

import { t } from 'vjcad';

export const ANNO_LAYER_NAME = '_ANNOTATION';
export const ANNO_COLOR = 1; // ACI red
export const ANNO_TOOLBAR_ID = 'annotation-tools';

export const STAMP_PRESETS = [
    { id: 'approved', label: () => t('anno.stamp.approved'), text: () => t('anno.stamp.approved') },
    { id: 'rejected', label: () => t('anno.stamp.rejected'), text: () => t('anno.stamp.rejected') },
    { id: 'reviewed', label: () => t('anno.stamp.reviewed'), text: () => t('anno.stamp.reviewed') },
    { id: 'revised',  label: () => t('anno.stamp.revised'), text: () => t('anno.stamp.revised') },
    { id: 'void',     label: () => t('anno.stamp.void'), text: () => t('anno.stamp.void') },
    { id: 'draft',    label: () => t('anno.stamp.draft'), text: () => t('anno.stamp.draft') },
] as const;
