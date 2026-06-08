import React, { useState, useRef, useMemo } from 'react';
import {
  IonApp,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonPopover,
  setupIonicReact,
} from '@ionic/react';

setupIonicReact({ mode: 'ios' });

const USERS = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince',
  'Eve Williams',
  'Frank Miller',
  'Grace Lee',
  'Henry Wilson',
];

/**
 * Bug: IonPopover with keyboardClose={false} still closes the mobile keyboard.
 *
 * In @ionic/core >= 8.7.4, the `present()` function in the overlay system calls
 * `restoreElementFocus()` at the start of presentation. That function unconditionally
 * calls `previousElement.blur()` ("to prevent a11y warning issues"), which blurs
 * the currently focused textarea and closes the mobile keyboard.
 *
 * This happens regardless of keyboardClose={false}.
 *
 * Works correctly in @ionic/core 8.7.3 where restoreElementFocus() was called
 * AFTER the animation and did NOT have the unconditional blur() call.
 *
 * Steps to reproduce:
 * 1. Open on a mobile device (or Chrome DevTools mobile emulation with touch keyboard)
 * 2. Tap the textarea to focus it (keyboard opens)
 * 3. Type "@" — a popover with user suggestions should appear
 * 4. BUG: The keyboard closes immediately, preventing typing to filter the list
 *
 * Expected: The keyboard should stay open (as keyboardClose={false} promises),
 * allowing the user to continue typing to filter the suggestions.
 */
const App = () => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const isMentioning = useMemo(() => {
    if (!textareaRef.current) return false;
    const textBeforeCursor = value.slice(0, textareaRef.current.selectionStart);
    return /(?:^|\s)@\w*$/.test(textBeforeCursor);
  }, [value]);

  const search = useMemo(() => {
    if (!isMentioning) return '';
    return value.slice(0, textareaRef.current?.selectionStart).split('@').pop() || '';
  }, [value, isMentioning]);

  const filteredUsers = useMemo(
    () => USERS.filter((u) => u.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const showPopover = isMentioning && filteredUsers.length > 0;

  const selectUser = (e, user) => {
    e.preventDefault();
    const before = value.slice(0, textareaRef.current?.selectionStart);
    const after = value.slice(textareaRef.current?.selectionStart);
    const newBefore = before.split('@').slice(0, -1).join('@') + `@${user} `;
    setValue(newBefore + after);
    textareaRef.current?.focus();
  };

  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>IonPopover keyboardClose bug</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>
            Type <strong>@</strong> in the textarea below. A popover with user
            suggestions should appear. On mobile, the keyboard should stay open
            so you can type to filter — but it closes immediately due to the bug.
          </p>

          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Try typing "@ali" to mention Alice...'
              rows={4}
              style={{
                width: '100%',
                fontSize: '16px',
                padding: '8px',
                boxSizing: 'border-box',
              }}
            />

            {showPopover && (
              <IonPopover
                isOpen={showPopover}
                size="cover"
                dismissOnSelect={true}
                keyboardClose={false}
                style={{
                  '--max-height': '12em',
                  '--backdrop-opacity': '0.1',
                  '--offset-y': '-4em',
                }}
              >
                <IonList>
                  {filteredUsers.map((user) => (
                    <IonItem key={user} onMouseDown={(e) => selectUser(e, user)}>
                      <IonLabel>{user}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonPopover>
            )}
          </div>

          <p style={{ marginTop: '2em', fontSize: '0.85em', color: '#666' }}>
            <strong>Root cause:</strong> In <code>@ionic/core &gt;= 8.7.4</code>,{' '}
            <code>present()</code> calls <code>restoreElementFocus()</code> at the
            start, which unconditionally calls <code>previousElement.blur()</code>{' '}
            — ignoring <code>keyboardClose=false</code>. On mobile, <code>blur()</code>{' '}
            closes the keyboard and <code>focus()</code> cannot reopen it without a
            user gesture. Works in <code>@ionic/core 8.7.3</code>.
          </p>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;
