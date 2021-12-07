import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'generateCustomTemplateSummery',
    pure: false
})
export class GenerateCustomTemplateSummeryPipe implements PipeTransform {
    transform(customTemplateList: Array<any>, patientName?: string): Array<any> {
        if (customTemplateList.length) {
            return this.generateCustomTemplateSummary(customTemplateList, patientName);
        }
        return customTemplateList;
    }

    generateCustomTemplateSummary(array, patientName): any {
        const tags: Array<{ value: any, name: string }> = [];
        const templates = _.uniqBy(array, 'template_id');
        templates.forEach(template => {
            const forms = _.uniqBy(array.filter(a => a.template_id === template.template_id), 'form_id');
            forms.forEach(form => {
                let tag = '<b>' + (form.form_summary_heading || '') + '</b>';
                const queGroups = _.uniqBy(array.filter(a => a.form_id === form.form_id), 'que_group_id');
                queGroups.forEach(queGroup => {
                    if(queGroup.section_group_format === 'tabular') {
                        tag = '';
                        return;
                    }
                    tag += `\n ` + (queGroup.que_group_name ? ('<br /> ' + queGroup.que_group_name) : '');
                    const questions = _.uniqBy(array.filter(a => a.que_group_id === queGroup.que_group_id), 'question_id');
                    questions.forEach(question => {
                        // var objAnswers = get unique answers by que id from array;
                        const objStorySeting = question.story_setting;
                        let storyTag = objStorySeting ? objStorySeting.replace('#Title#', 'Mr.').replace('#PatientName#', patientName) : null;

                        const isStorySettingExists = storyTag ? true : false;
                        const answers = array.filter(a => a.question_id === question.question_id);
                        answers.forEach(answer => {
                            // const replaceTag = ('#Answer' + answer.answer_row_id + '#');
                            //const replaceTag = ('#Answer' + answer.ans_group_key.replace('grp', '') + '#');
                            if (isStorySettingExists) {
                              const replaceTag = ('#Answer' + (answer.ans_group_seq || 1) + '#');
                              storyTag = storyTag.replace(replaceTag, answer.answer_text);
                            } else {
                              storyTag += '\n <br /> > ' + answer.answer_text;
                            }
                        });

                        // remaining Answer tags need to remove
                        if (storyTag.indexOf('#Answer') !== -1) {
                            for (let i = 1; i < 50; i++) {
                                const replaceTag = ('#Answer' + i + '#');
                                storyTag = storyTag.replace(replaceTag, '');
                            }
                        }

                        tag += '\n <br /> > ' + storyTag;
                    });
                });
                tags.push({ value: tag, name: template.template_name });
            });
        });
        return [...tags];
    }
}
