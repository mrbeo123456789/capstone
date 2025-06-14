import React, {useRef, useState} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { BASE_URL } from "../../contant/contant.js";

const RichTextEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);

    return (
        <div>
            <Editor
                value={value}
                apiKey='u5vai3dczlua38irw5yxf1fzobnooqknlvbi8tesy4aqtxoo'
                onInit={(evt, editor) => (editorRef.current = editor)}
                onEditorChange={(content) => {
                    onChange?.(content); // ⬅️ Send value to parent
                }}
                init={{
                    selector: 'textarea#full-featured',
                    height: 600,
                    menubar: 'file edit view insert format tools table tc help',
                    plugins:
                        'preview importcss tinydrive searchreplace autolink autosave save directionality visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars linkchecker emoticons',
                    toolbar:
                        'undo redo | aidialog aishortcuts | blocks fontsizeinput | bold italic | align numlist bullist | link image | table media pageembed | lineheight outdent indent | strikethrough forecolor backcolor formatpainter removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample mergetags | inserttemplate | addcomment showcomments | ltr rtl casechange | spellcheckdialog',
                    autosave_ask_before_unload: true,
                    autosave_interval: '30s',
                    autosave_prefix: '{path}{query}-{id}-',
                    autosave_restore_when_empty: false,
                    autosave_retention: '2m',
                    image_advtab: true,
                    image_caption: true,
                    paste_data_images: true,
                    automatic_uploads: true,
                    quickbars_selection_toolbar:
                        'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                    noneditable_class: 'mceNonEditable',
                    toolbar_mode: 'sliding',
                    spellchecker_ignore_list: ['Ephox', 'Moxiecode', 'tinymce', 'TinyMCE'],
                    content_style: '.mymention{ color: gray; }',
                    a11y_advanced_options: true,
                    autocorrect_capitalize: true,
                    link_list: [
                        { title: 'My page 1', value: 'https://www.tiny.cloud' },
                        { title: 'My page 2', value: 'http://www.moxiecode.com' },
                    ],
                    image_list: [
                        { title: 'Image 1', value: 'https://www.tiny.cloud' },
                        { title: 'Image 2', value: 'http://www.moxiecode.com' },
                    ],
                    image_class_list: [
                        { title: 'None', value: '' },
                        { title: 'Some class', value: 'class-name' },
                    ],
                    importcss_append: true,
                    typography_rules: [
                        'common/punctuation/quote',
                        'en-US/dash/main',
                        'common/nbsp/afterParagraphMark',
                        'common/nbsp/afterSectionMark',
                        'common/nbsp/afterShortWord',
                        'common/nbsp/beforeShortLastNumber',
                        'common/nbsp/beforeShortLastWord',
                        'common/nbsp/dpi',
                        'common/punctuation/apostrophe',
                        'common/space/delBeforePunctuation',
                        'common/space/afterComma',
                        'common/space/afterColon',
                        'common/space/afterExclamationMark',
                        'common/space/afterQuestionMark',
                        'common/space/afterSemicolon',
                        'common/space/beforeBracket',
                        'common/space/bracket',
                        'common/space/delBeforeDot',
                        'common/space/squareBracket',
                        'common/number/mathSigns',
                        'common/number/times',
                        'common/number/fraction',
                        'common/symbols/arrow',
                        'common/symbols/cf',
                        'common/symbols/copy',
                        'common/punctuation/delDoublePunctuation',
                        'common/punctuation/hellip',
                    ],
                    typography_ignore: ['code'],
                    tinydrive_token_provider: (success, failure) => {
                        const token = localStorage.getItem("jwt_token"); // your auth token

                        fetch(`${BASE_URL}tinymce/token`, {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Accept": "application/json",
                                "Origin":  window.location.origin,
                            },
                        })
                            .then((res) => {
                                if (!res.ok) throw new Error("Failed to get TinyMCE token");
                                return res.json();
                            })
                            .then((data) => {
                                success({ token: data.token });
                            })
                            .catch((err) => {
                                console.error("TinyMCE token error:", err);
                                failure("Could not retrieve TinyMCE token");
                            });
                    },
                    tinydrive_log_level: 'debug', // 👈 enable log output


                    revisionhistory_fetch: async () => [],
                    advtemplate_list: async () => [],
                    mergetags_list: [],
                    // Other advanced settings can be injected here as needed
                }}
            />
        </div>
    );
}

export default RichTextEditor;
