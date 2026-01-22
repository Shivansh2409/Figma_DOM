# SimpleFigma Clone 🎨

Welcome to **SimpleFigma Clone**! It’s a super lightweight vector graphics editor that runs right in your browser, inspired by Figma.

We kept it simple—just one file built with HTML5, Vanilla JS, and Tailwind CSS. Jump in and start making shapes, messing with text, organizing layers, and exporting your designs!

---

## ✨ Features

### 🎨 Let's Get Creative
* **Shapes:** Whip up Rectangles, Circles, and Triangles in a snap.
* **Text:** Type it out! You can customize the content, change the font size, pick a color, and align it (Left, Center, Right) however you like.
* **Styling:** Tweak fill colors and text colors on the fly and watch them update instantly.

### 🖱️ Move It, Shake It
* **Drag & Drop:** Grab elements and slide them freely around the canvas.
* **Resizing:** Just grab any of the four corners to make things bigger or smaller.
* **Rotation:** Use the handle at the top to spin your creations to the perfect angle.
* **Keyboard Shortcuts:**
    * **Arrow Keys:** Nudge things around (5px at a time).
    * **Delete / Backspace:** Get rid of stuff you don't need.
    * *Note: We've added boundaries so your elements don't get lost off-screen!*

### 📚 Stack 'Em Up (Layers)
* **Visual Layer List:** See everything you've created in a neat list.
* **Reordering:**
    * **Drag & Drop:** Drag distinct layers in the sidebar to switch up their order.
    * **Buttons:** Use the buttons to send things backward or bring them forward.
* **Selection Sync:** Click a layer in the list, and we'll highlight it on the canvas. Easy!

### 💾 Safe & Sound
* **Auto-Save:** We automatically save your changes to your browser's `localStorage`. Refresh the page? No worries, your design is still there!
* **Export JSON:** Download a backup of your project data so you never lose your layout.
* **Export HTML:** Turn your design into a standalone HTML file with inline styles.

---

## 🛠️ Under the Hood

* **HTML5:** For the skeleton.
* **CSS3 & Tailwind CSS:** For the looks and layout (loaded via CDN).
* **Vanilla JavaScript (ES6+):** All the brains, logic, and fancy math for rotation and resizing.
* **Lucide Icons:** To make the UI look sharp.

### 🧠 The Nerdy Bit
The app uses a central `app` object to keep track of every element on the canvas.
* **State:** `app.elements` holds all the data for your objects.
* **Rendering:** When you drag, resize, or edit something, we update the DOM in real-time.
* **Math:** We use trigonometric projection to handle mouse movements when resizing rotated elements (so it feels smooth!).

---

## 🚀 Let's Go!

Since this is just a single file, you don't need to install anything complicated.

1.  **Download:** Save the `index.html` file to your computer.
2.  **Run:** Open the file in Chrome, Firefox, Safari, or whatever browser you prefer.
3.  **Enjoy:** Start designing right away!

---

## 📖 Quick Tips

* **Adding Elements:** Click the shape icons (Square, Circle, Triangle) or the Text icon at the top to drop them in.
* **Editing Properties:** Click an element to select it. The sidebar on the right will show you all the settings you can tweak (Size, Rotation, Colors, etc.).
* **Managing Layers:** Check out the left sidebar to see your layers. Drag them around to change the order or click to select one.
* **Exporting:** When you're ready, use the icons in the top-right corner.
    * **JSON Icon:** Downloads your `design.json` backup.
    * **Code Icon:** Downloads a ready-to-use `design.html` file.

---

## 📄 License

This project is open-source, so feel free to use it for whatever you like!
