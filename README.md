# IonPopover `keyboardClose={false}` does not prevent keyboard dismissal on mobile

## Bug description

When an `IonPopover` with `keyboardClose={false}` is presented while a text input is focused, the mobile keyboard closes immediately. The `keyboardClose={false}` prop should prevent this behavior.

This is a regression introduced between `@ionic/core@8.7.3` (working) and `@ionic/core@8.7.4`+ (broken). Still broken in `8.8.9`.

## Root cause

In `@ionic/core >= 8.7.4`, two changes were made to the `present()` function in the overlay system (`overlays.ts`):

1. **`restoreElementFocus()` was moved from after the animation to the very start of `present()`**. Previously it ran after the overlay was fully presented; now it runs immediately when presentation begins.

2. **`restoreElementFocus()` gained an unconditional `previousElement.blur()` call**:
   ```js
   const restoreElementFocus = async (overlayEl) => {
     let previousElement = document.activeElement;
     if (!previousElement) return;
     // This line was added:
     previousElement.blur(); // <-- unconditionally blurs the focused element
     // ...
   };
   ```

This `blur()` call is **not guarded by `keyboardClose`**, so it fires regardless of the `keyboardClose={false}` prop. On mobile browsers, `blur()` closes the virtual keyboard, and programmatic `focus()` cannot reopen it (requires a user gesture).

## Steps to reproduce

1. `npm install && npm run dev`
2. Open on a mobile device (or Chrome DevTools mobile simulation)
3. Tap the textarea to focus it (keyboard opens)
4. Type `@` — a popover with user suggestions appears
5. **Bug**: The keyboard closes immediately, preventing typing to filter the list

## Expected behavior

The keyboard should stay open when the popover appears, allowing the user to continue typing to filter the suggestions — as `keyboardClose={false}` promises.

## Workaround

Pin `@ionic/react` and `@ionic/react-router` to version `8.7.3`.

## Versions

- **Broken**: `@ionic/core` 8.7.4 through 8.8.9 (latest stable) and 8.8.10-nightly
- **Working**: `@ionic/core` 8.7.3
