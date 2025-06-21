import { uploadFile } from '@/services/upload';
import { BaseKit } from 'reactjs-tiptap-editor';
import { History } from 'reactjs-tiptap-editor/history';
import { SearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { TextDirection } from 'reactjs-tiptap-editor/textdirection';
import { FormatPainter } from 'reactjs-tiptap-editor/formatpainter';
import { Clear } from 'reactjs-tiptap-editor/clear';
import { FontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { Heading } from 'reactjs-tiptap-editor/heading';
import { FontSize } from 'reactjs-tiptap-editor/fontsize';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Strike } from 'reactjs-tiptap-editor/strike';
import { MoreMark } from 'reactjs-tiptap-editor/moremark';
import { Katex } from 'reactjs-tiptap-editor/katex';
import { Emoji } from 'reactjs-tiptap-editor/emoji';
import { Color } from 'reactjs-tiptap-editor/color';
import { Highlight } from 'reactjs-tiptap-editor/highlight';
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { TextAlign } from 'reactjs-tiptap-editor/textalign';
import { Indent } from 'reactjs-tiptap-editor/indent';
import { LineHeight } from 'reactjs-tiptap-editor/lineheight';
import { TaskList } from 'reactjs-tiptap-editor/tasklist';
import { Link } from 'reactjs-tiptap-editor/link';
import { Image } from 'reactjs-tiptap-editor/image';
import { Blockquote } from 'reactjs-tiptap-editor/blockquote';
import { SlashCommand } from 'reactjs-tiptap-editor/slashcommand';
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Code } from 'reactjs-tiptap-editor/code';
import { CodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Table } from 'reactjs-tiptap-editor/table';
import { Iframe } from 'reactjs-tiptap-editor/iframe';
import { ExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ExportWord } from 'reactjs-tiptap-editor/exportword';
import { Excalidraw } from 'reactjs-tiptap-editor/excalidraw';
import { Attachment } from 'reactjs-tiptap-editor/attachment';
import { Mermaid } from 'reactjs-tiptap-editor/mermaid';

export const editorExtensions = [
  BaseKit.configure({
    multiColumn: true,
    placeholder: {
      showOnlyCurrent: true,
    },
    characterCount: {
      limit: 50_000,
    },
  }),
  History,
  SearchAndReplace,
  TextDirection,
  FormatPainter.configure({ spacer: true }),
  Clear,
  FontFamily,
  Heading.configure({ spacer: true }),
  FontSize,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  MoreMark,
  Katex,
  Emoji,
  Color.configure({ spacer: true }),
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph'], spacer: true }),
  Indent,
  LineHeight,
  TaskList.configure({
    spacer: true,
    taskItem: {
      nested: true,
    },
  }),
  Link,
  Image.configure({
    upload: async (files: File) => {
      const { url } = await uploadFile(files);
      return url;
    },
  }),
  Blockquote.configure({ spacer: true }),
  SlashCommand,
  HorizontalRule,
  Code.configure({
    toolbar: false,
  }),
  CodeBlock,
  Table,
  Iframe,
  ExportPdf.configure({ spacer: true }),
  ExportWord,
  Excalidraw,
  Attachment.configure({
    upload: async (file: File) => {
      const { url } = await uploadFile(file);
      return url;
    },
  }),
  Mermaid.configure({
    upload: async (file: File) => {
      const { url } = await uploadFile(file);
      return url;
    },
  }),
];
