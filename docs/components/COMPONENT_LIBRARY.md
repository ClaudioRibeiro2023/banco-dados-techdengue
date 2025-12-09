# 📚 Component Library - Complete Documentation

**TechDengue Analytics Design System v5.0.0**  
**Component Reference Guide**

---

## 📋 Table of Contents

1. [Mobile Drawer](#mobile-drawer)
2. [Tooltip](#tooltip)
3. [Keyboard Shortcuts](#keyboard-shortcuts)
4. [Empty States](#empty-states)
5. [Error States](#error-states)
6. [Loading States](#loading-states)
7. [Metric Card](#metric-card)
8. [Badge](#badge)
9. [Alert](#alert)

---

## 🎯 Mobile Drawer {#mobile-drawer}

**File:** `dashboard/components/mobile_drawer.py`

### Overview

Responsive navigation drawer for mobile devices with slide-in animation, focus trap, and full accessibility support.

### Usage

```python
from dashboard.components.mobile_drawer import create_mobile_drawer

items = [
    {'label': 'Home', 'icon': '🏠', 'path': '/', 'badge': None},
    {'label': 'Análises', 'icon': '📊', 'path': '/Analises', 'badge': None},
    {'label': 'Qualidade', 'icon': '✅', 'path': '/Qualidade_Dados', 'badge': '3'},
]

html = create_mobile_drawer(items, active_page='/')
st.markdown(html, unsafe_allow_html=True)
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `items` | `list[dict]` | - | ✅ | List of navigation items |
| `active_page` | `str` | `""` | ❌ | Path of currently active page |

### Item Structure

```python
{
    'label': str,      # Display label
    'icon': str,       # Emoji or HTML icon
    'path': str,       # URL path
    'badge': str|None  # Optional badge (e.g., notification count)
}
```

### Variants

**Basic:**
```python
create_mobile_drawer(items, '/')
```

**With Header:**
```python
create_mobile_header_with_drawer(
    title="TechDengue Analytics",
    nav_items=items
)
```

### States

- **Closed** - Hidden offscreen (default)
- **Open** - Visible with overlay
- **Focus** - First focusable element receives focus
- **Hover** - Menu items show hover state

### Accessibility

- ✅ `role="dialog"` and `aria-modal="true"`
- ✅ Focus trap when open
- ✅ ESC key closes drawer
- ✅ Returns focus on close
- ✅ Body scroll lock
- ✅ Touch targets 44px+

### Keyboard

- `Esc` - Close drawer
- `Tab` - Navigate through items
- `Enter` - Activate item

### Examples

**Complete Implementation:**
```python
items = [
    {'label': 'Home', 'icon': '🏠', 'path': '/', 'badge': None},
    {'label': 'Análises', 'icon': '📊', 'path': '/Analises', 'badge': '2'},
    {'label': 'Mega Tabela', 'icon': '📋', 'path': '/Mega_Tabela', 'badge': None},
    {'label': 'Qualidade', 'icon': '✅', 'path': '/Qualidade_Dados', 'badge': '5'},
]

drawer_html = create_mobile_drawer(items, active_page='/Analises')
st.markdown(drawer_html, unsafe_allow_html=True)
```

### CSS Classes

- `.mobile-drawer` - Container
- `.drawer-overlay` - Background overlay
- `.drawer-content` - Drawer panel
- `.drawer-header` - Top section
- `.drawer-nav` - Navigation container
- `.drawer-item` - Navigation link
- `.drawer-item.active` - Active link state
- `.drawer-footer` - Bottom section

### Testing

```python
def test_drawer_generates():
    items = [{'label': 'Test', 'icon': '📊', 'path': '/', 'badge': None}]
    result = create_mobile_drawer(items, '/')
    assert "role=\"dialog\"" in result
    assert "Test" in result
```

---

## 💬 Tooltip {#tooltip}

**File:** `dashboard/components/tooltip.py`

### Overview

Accessible tooltip component with 4 positioning options and keyboard support.

### Usage

```python
from dashboard.components.tooltip import (
    create_tooltip,
    create_icon_with_tooltip,
    create_help_tooltip
)

# Basic tooltip
html = create_tooltip(
    content='<button>Save</button>',
    tooltip_text='Save changes (Ctrl+S)',
    position='top'
)

# Icon with tooltip
html = create_icon_with_tooltip(
    icon='ℹ️',
    tooltip_text='More information',
    position='top'
)

# Help tooltip
html = create_help_tooltip(
    text='Column Name',
    help_text='Description of this column'
)
```

### Props

**`create_tooltip`:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `content` | `str` | - | ✅ | HTML content to wrap |
| `tooltip_text` | `str` | - | ✅ | Text to show in tooltip |
| `position` | `str` | `"top"` | ❌ | Position (top/right/bottom/left) |

### Variants

- **Basic** - Standard tooltip
- **Icon** - Icon with tooltip
- **Help** - Text with help icon + tooltip

### Positions

- `top` - Above element
- `right` - Right of element
- `bottom` - Below element
- `left` - Left of element

### Accessibility

- ✅ `role="tooltip"`
- ✅ `aria-describedby`
- ✅ Keyboard accessible (focus/hover)
- ✅ ESC to dismiss (if focused)

### Examples

**Button with Tooltip:**
```python
button_html = '<button class="btn btn-primary">Save</button>'
html = create_tooltip(
    content=button_html,
    tooltip_text='Save your changes',
    position='top'
)
```

**Help Icon:**
```python
html = create_icon_with_tooltip(
    icon='❓',
    tooltip_text='Click for more information',
    position='right'
)
```

**Inline Help:**
```python
html = create_help_tooltip(
    text='Data Quality Score',
    help_text='Percentage of records passing all validation checks'
)
```

### CSS Classes

- `.tooltip-wrapper` - Container
- `.tooltip` - Tooltip element
- `.tooltip-top` - Top position
- `.tooltip-right` - Right position
- `.tooltip-bottom` - Bottom position
- `.tooltip-left` - Left position
- `.tooltip-arrow` - Arrow indicator

---

## ⌨️ Keyboard Shortcuts {#keyboard-shortcuts}

**File:** `dashboard/components/keyboard_shortcuts.py`

### Overview

Global keyboard shortcuts system with visual panel and accessibility support.

### Usage

```python
from dashboard.components.keyboard_shortcuts import create_shortcuts_panel

# Add to layout
html = create_shortcuts_panel()
st.markdown(html, unsafe_allow_html=True)
```

### Default Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `Ctrl+K` | Search | Activate global search |
| `Ctrl+F` | Filter | Focus on filters |
| `Ctrl+H` | Home | Navigate to home |
| `?` | Help | Show shortcuts panel |
| `Esc` | Close | Close modals/panels |

### Features

- ✅ Global keyboard listener
- ✅ Doesn't interfere with inputs
- ✅ Visual panel (`?` key)
- ✅ First-time hint
- ✅ localStorage persistence

### Accessibility

- ✅ `role="dialog"` for panel
- ✅ Focus management
- ✅ Clear visual indicators (`<kbd>` tags)
- ✅ Documented in panel

### Customization

Edit `SHORTCUTS` dict in file:

```python
SHORTCUTS = {
    'custom': {
        'key': 'g',
        'mod': 'ctrl',
        'label': 'Go',
        'action': 'goToPage()',
        'description': 'Navigate quickly'
    }
}
```

### Examples

**Add to Page:**
```python
# In your page file
html = create_shortcuts_panel()
st.markdown(html, unsafe_allow_html=True)
```

**Custom Shortcut:**
```python
# Modify keyboard_shortcuts.py
SHORTCUTS['export'] = {
    'key': 'e',
    'mod': 'ctrl',
    'label': 'Export',
    'action': 'triggerExport()',
    'description': 'Export current data'
}
```

---

## 📭 Empty States {#empty-states}

**File:** `dashboard/components/empty_error_states.py`

### Overview

Friendly empty state components with optional call-to-action.

### Usage

```python
from dashboard.components.empty_error_states import (
    create_empty_state,
    create_empty_search_state,
    create_empty_filtered_state
)

# Basic empty state
html = create_empty_state(
    icon='📊',
    title='No data available',
    description='There are no records to display',
    action_label='Reload',
    action_onclick='window.location.reload()'
)

# Empty search
html = create_empty_search_state(search_term='test')

# Empty filtered
html = create_empty_filtered_state()
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `icon` | `str` | `"📭"` | ❌ | Emoji or icon |
| `title` | `str` | - | ✅ | Main heading |
| `description` | `str` | - | ✅ | Detailed message |
| `action_label` | `str` | `None` | ❌ | Button text |
| `action_onclick` | `str` | `None` | ❌ | JS action |
| `action_variant` | `str` | `"primary"` | ❌ | Button style |

### Variants

- **Generic** - `create_empty_state()`
- **Search** - `create_empty_search_state()`
- **Filtered** - `create_empty_filtered_state()`

### Accessibility

- ✅ `role="status"`
- ✅ `aria-live="polite"`
- ✅ Clear messaging

### Examples

**No Records:**
```python
html = create_empty_state(
    icon='📊',
    title='No records found',
    description='The database is currently empty',
    action_label='Import Data',
    action_onclick='openImport()'
)
```

**Search Results:**
```python
html = create_empty_search_state(search_term='municipality X')
# Shows: "No results found for 'municipality X'"
```

**Filtered View:**
```python
html = create_empty_filtered_state()
# Shows: "No records with selected filters"
```

---

## ⚠️ Error States {#error-states}

**File:** `dashboard/components/empty_error_states.py`

### Overview

User-friendly error states with retry actions and technical details.

### Usage

```python
from dashboard.components.empty_error_states import (
    create_error_state,
    create_connection_error_state,
    create_permission_error_state
)

# Basic error
html = create_error_state(
    error_message='Could not load data',
    retry_action='reloadData()',
    details='FileNotFoundError: data.parquet',
    error_code='ERR_001'
)

# Connection error
html = create_connection_error_state(retry_action='window.location.reload()')

# Permission error
html = create_permission_error_state()
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `error_message` | `str` | - | ✅ | User-friendly message |
| `retry_action` | `str` | `None` | ❌ | JS retry function |
| `details` | `str` | `None` | ❌ | Technical details |
| `error_code` | `str` | `None` | ❌ | Error code |
| `show_support` | `bool` | `True` | ❌ | Show support link |

### Variants

- **Generic** - `create_error_state()`
- **Connection** - `create_connection_error_state()`
- **Permission** - `create_permission_error_state()`

### Accessibility

- ✅ `role="alert"`
- ✅ `aria-live="assertive"`
- ✅ Clear error messaging
- ✅ Expandable details

### Examples

**Data Load Error:**
```python
html = create_error_state(
    error_message='Failed to load Mega Tabela',
    retry_action='reloadMegaTabela()',
    details='ParquetException: Invalid file format',
    error_code='ERR_DATA_001'
)
```

**Network Error:**
```python
html = create_connection_error_state(
    retry_action='window.location.reload()'
)
```

---

## ⏳ Loading States {#loading-states}

**File:** `dashboard/components/empty_error_states.py`

### Overview

Skeleton loaders and spinners for loading states.

### Usage

```python
from dashboard.components.empty_error_states import (
    create_loading_skeleton,
    create_loading_card_skeleton,
    create_loading_table_skeleton,
    create_spinner
)

# Basic skeleton
html = create_loading_skeleton(width='100%', height='20px', count=3)

# Card skeleton
html = create_loading_card_skeleton()

# Table skeleton
html = create_loading_table_skeleton(rows=5, columns=4)

# Spinner
html = create_spinner(size='md', color='primary', label='Loading...')
```

### Spinner Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `str` | `"md"` | sm/md/lg/xl |
| `color` | `str` | `"primary"` | primary/success/warning/error |
| `label` | `str` | `"Loading..."` | Accessible label |

### Accessibility

- ✅ `role="status"`
- ✅ `aria-live="polite"`
- ✅ `.sr-only` label for spinners

### Examples

**Loading Card:**
```python
if data is None:
    st.markdown(create_loading_card_skeleton(), unsafe_allow_html=True)
else:
    # Show actual card
    ...
```

**Loading Table:**
```python
if df is None:
    st.markdown(create_loading_table_skeleton(rows=10, columns=5), unsafe_allow_html=True)
else:
    st.dataframe(df)
```

---

## 📊 Metric Card {#metric-card}

**File:** `dashboard/components/ui_components.py`

### Usage

```python
from dashboard.components.ui_components import create_metric_card_modern

html = create_metric_card_modern(
    icon='📊',
    title='Total Records',
    value='1,234',
    change=5.2,
    color='primary',
    size='default',
    tooltip='Total number of records'
)
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `str` | - | Emoji or icon |
| `title` | `str` | - | Metric label |
| `value` | `str` | - | Main value |
| `change` | `float\|None` | `None` | Percentage change |
| `color` | `str` | `"primary"` | Card color |
| `size` | `str` | `"default"` | sm/default/lg |
| `tooltip` | `str` | `None` | Tooltip text |

---

## 🏷️ Badge {#badge}

**File:** `dashboard/components/ui_components.py`

### Usage

```python
from dashboard.components.ui_components import create_badge

html = create_badge('Active', 'success')
html = create_badge('⚠️ Warning', 'warning')
```

### Variants

- `success` - Green
- `warning` - Orange
- `error` - Red
- `info` - Blue
- `default` - Gray

---

## 📢 Alert {#alert}

**File:** `dashboard/components/ui_components.py`

### Usage

```python
from dashboard.components.ui_components import create_modern_alert

html = create_modern_alert(
    'Operation successful',
    type='success',
    icon='✅'
)
```

### Types

- `info` - Blue
- `success` - Green
- `warning` - Orange
- `error` - Red

---

## 🎨 Design Tokens Reference

All components use design tokens defined in:
- `dashboard/assets/tokens.css`
- `dashboard/assets/tokens-extended.css`

### Key Tokens

**Colors:** `--color-primary-*`, `--color-success-*`, etc.  
**Spacing:** `--space-1` through `--space-96`  
**Typography:** `--text-xs` through `--text-4xl`  
**Motion:** `--duration-*`, `--ease-*`  
**Elevation:** `--elevation-*`, `--z-*`

---

## 📝 Contributing

See `CONTRIBUTING.md` for guidelines on:
- Adding new components
- Modifying existing ones
- Testing requirements
- Documentation standards

---

## ✅ Checklist for New Components

- [ ] Create component function with docstring
- [ ] Add type hints where applicable
- [ ] Implement all variants
- [ ] Add ARIA attributes
- [ ] Test keyboard navigation
- [ ] Write unit tests (>80% coverage)
- [ ] Document in this file
- [ ] Add usage examples
- [ ] Test accessibility (axe, WAVE)

---

**Last Updated:** 30/10/2025  
**Version:** v5.0.0  
**Status:** ✅ Complete
