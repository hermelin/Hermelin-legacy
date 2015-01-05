The file custom_layout.json is a sample keyboard layout
Every action can be called via a sequence of keyboard inputs
The string specifies this sequence. Each part of the sequence can be written
via the following notation:

Simple ascii characters, e.g.: a
These are just your usual characters. Keep in mind that this is based on your
keyboard, so if you specifiy for Example A this usually means it only works
when you press Shift+a

Due to bugs in webkit (or broken keyboard events in browsers in general) you
can't right now create combinations with alt or ctrl.

Examples:

Ohai!
Press Shift+o, then h, then a, then i, then !

Copy
Press Shift+c, then o, then p, then y

You don't need to specify every action, just leave the value empty or remove
the key.

When you are done save the file somewhere in keyboard/ and specify the
name and the path of your layout in layouts.json.
Make sure that your JSON is valid!

If you now start Hermelin your layout should appear in the keyboard options