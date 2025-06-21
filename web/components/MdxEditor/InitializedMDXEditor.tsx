'use client';

import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  type MDXEditorMethods,
  type MDXEditorProps,
  tablePlugin,
  InsertTable,
  BlockTypeSelect,
  InsertCodeBlock,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  DiffSourceToggleWrapper,
  diffSourcePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

type InitializedMDXEditorProps = MDXEditorProps & {
  editorRef?: React.ForwardedRef<MDXEditorMethods>;
};

export default function InitializedMDXEditor({ editorRef, ...props }: InitializedMDXEditorProps) {
  return (
    <MDXEditor
      ref={editorRef}
      className={`${props.className || ''}`}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'text' }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            js: 'JavaScript',
            css: 'CSS',
            ts: 'TypeScript',
            html: 'HTML',
            py: 'Python',
            text: 'Text',
          },
        }),
        tablePlugin(),
        diffSourcePlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <div className="flex flex-wrap items-center gap-2">
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <CreateLink />
                <ListsToggle />
                <InsertTable />
                <ConditionalContents
                  options={[
                    {
                      when: (editor) => editor?.editorType === 'codeblock',
                      contents: () => <ChangeCodeMirrorLanguage />,
                    },
                    {
                      fallback: () => (
                        <>
                          <InsertCodeBlock />
                        </>
                      ),
                    },
                  ]}
                />
                <BlockTypeSelect />
              </DiffSourceToggleWrapper>
            </div>
          ),
        }),
      ]}
      {...props}
    />
  );
}
