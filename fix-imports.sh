#!/bin/bash

# Fix incorrect Radix UI imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-slot"/g'

# Fix specific components
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-select"/g' src/components/ui/select.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-dialog"/g' src/components/ui/sheet.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-label"/g' src/components/ui/label.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-tabs"/g' src/components/ui/tabs.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-accordion"/g' src/components/ui/accordion.tsx

# Fix other common incorrect imports
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-button"/g' src/components/ui/button.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-avatar"/g' src/components/ui/avatar.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-checkbox"/g' src/components/ui/checkbox.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-dialog"/g' src/components/ui/dialog.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-dropdown-menu"/g' src/components/ui/dropdown-menu.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-form"/g' src/components/ui/form.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-input"/g' src/components/ui/input.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-popover"/g' src/components/ui/popover.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-progress"/g' src/components/ui/progress.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-radio-group"/g' src/components/ui/radio-group.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-scroll-area"/g' src/components/ui/scroll-area.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-separator"/g' src/components/ui/separator.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-slider"/g' src/components/ui/slider.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-switch"/g' src/components/ui/switch.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-textarea"/g' src/components/ui/textarea.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-toggle"/g' src/components/ui/toggle.tsx
sed -i 's/@radix-ui\/react-accordion"/@radix-ui\/react-tooltip"/g' src/components/ui/tooltip.tsx

echo "Fixed imports"