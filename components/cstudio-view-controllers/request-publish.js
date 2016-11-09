/**
 * File: request-publish.js
 * Component ID: viewcontroller-requestpublish
 * @author: Roy Art
 * @date: 2015.04.15
 **/
(function(CStudioAuthoring){

    var Base = CStudioAuthoring.ViewController.Base,
        $ = jQuery;

    Base.extend('RequestPublish', {

        actions: ['.close-button', '.submit-button'],

        startup: ['initDatePicker'],

        renderItems: renderItems,

        submitButtonActionClicked: submit,

        closeButtonActionClicked: closeButtonClicked,

        initDatePicker: initDatePicker

    });


    function closeButtonClicked() {
        this.end();
    }

    function submit() {
        var data = {
            sendEmail: this.getComponent('[name="notifyApproval"]').checked,
            schedule: this.getComponent('[name="schedulingMode"]:checked').value,
            submissionComment: this.getComponent('.submission-comment').value,
            items: []
        };

        var checked = this.getComponents('tbody input[type="checkbox"]:checked');
        $.each(checked, function (i, check) {
            data.items.push(check.getAttribute('data-item-id'));
        });

        if (data.schedule === 'custom') {
            data.scheduledDate =  getScheduledDateTimeForJson(this.getComponent('[name="scheduleDate"]').value);

            function pad(number, length){
                var str = "" + number
                while (str.length < length) {
                    str = '0'+str
                }
                return str
            }

            var offset = new Date().getTimezoneOffset()
            offset = ((offset<0? '+':'-')+ // Note the reversed sign!
            pad(parseInt(Math.abs(offset/60)), 2)+ ":" +
            pad(Math.abs(offset%60), 2));

            data.scheduledDate += offset;

        }



        //this.showProcessingOverlay(true);
        this.disableActions();
        this.fire("submitStart");
        //var data = this.getData(),
        var _this = this;
        CStudioAuthoring.Service.request({
            method: "POST",
            data: JSON.stringify(data),
            resetFormState: true,
            url: CStudioAuthoringContext.baseUri + "/api/1/services/api/1/workflow/submit-to-go-live.json?site="+CStudioAuthoringContext.site+"&user="+CStudioAuthoringContext.user,
            callback: {
                success: function(oResponse) {
                    _this.enableActions();
                    var oResp = JSON.parse(oResponse.responseText);
                    _this.fire("submitComplete", oResp);
                    _this.fire("submitEnd", oResp);
                    eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
                    eventNS.typeAction = "edit";
                    document.dispatchEvent(eventNS);
                    _this.end();
                },
                failure: function(oResponse) {
                    var oResp = JSON.parse(oResponse.responseText);
                    _this.fire("submitEnd", oResp);
                    _this.enableActions();
                    eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
                    eventNS.typeAction = "edit";
                    document.dispatchEvent(eventNS);
                }
            }
        });
    }

    function renderItems(items) {
        var me = this,
            $container = this.$('.item-listing tbody'),
            tpl = [
                '<tr>',
                '<td class="small">' +
                    '<input type="checkbox" class="select-all-check" data-item-id="_URI_" checked/>' +
                '</td> ' +
                '<td class="large">' +
                    '<div class="in"> ' +
                        '<span id="_INDEX_" class="toggleDependencies ttOpen parent-div-widget" style="margin-right:17px; margin-bottom: -2px; float: left;"></span> ' +
                        '<span style="overflow:hidden; display: block;">_INTERNALNAME_ _URI_</span>' +
                    '</div>' +
                '</td>' +
                ' <td class="medium">_SCHEDULE_</td> ' +
                '</tr>'].join(),
            depTpl = [
                '<tr class="_INDEX_" style="display:none;">',
                    '<td style="width:5%;"></td>',
                    // '<td class="text-center small" style="padding-left: 25px;width: 1%;"><input type="checkbox" class="item-checkbox" data-item-id="{uri}" checked/></td>', //TODO: checkbox to remove dependencies publish
                    '<td class="text-center small" style="padding-left: 25px;width: 5%;"></td>',
                    '<td class="name large"><div class="in">_INTERNALNAME_ _URI_</div></div></td>',
                '</tr>'
            ].join();

        $.each(items, function (index, item) {
            var itemDependenciesClass = "toggle-deps-" + index,
                $parentRow;

            item.index = itemDependenciesClass;
            $parentRow = $(tpl
                .replace('_INDEX_', item.index)
                .replace('_URI_', item.uri)
                .replace('_INTERNALNAME_', item.internalName)
                .replace('_SCHEDULE_', item.scheduledDate ? item.scheduledDate : "")
                .replace('_URI_', item.uri));

            if(index == 0) $container.empty();
            $container.append($parentRow);

            var data = "[ { uri:\"" +  item.uri + "\" }]";

            CStudioAuthoring.Service.loadItems({
                success: function(response){
                    var item = JSON.parse(response.responseText);

                    $.each(item.dependencies, function(index, dependency){
                        var elem = {};
                        elem.uri = dependency;
                        elem.internalName = '';
                        elem.scheduledDate = '';
                        elem.index = itemDependenciesClass;

                        $parentRow.after(depTpl
                            .replace('_INDEX_', elem.index)
                            .replace('_URI_', elem.uri)
                            .replace('_INTERNALNAME_', elem.internalName)
                            .replace('_URI_', elem.uri));
                    });
                }
            }, data);

        });

        $('.toggleDependencies').on('click', function(){
            var $container = $(me.getComponent('tbody')),
                parentId = $(this).attr('id'),
                $childItems = $container.find("." + parentId);

            if($(this).attr('class') == "ttClose parent-div-widget"){
                $childItems.hide();
                $(this).attr('class', 'ttOpen parent-div-widget');
            }else{
                $childItems.show();
                $(this).attr('class', 'ttClose parent-div-widget');
            }
        })
    }

    function initDatePicker() {

        var me = this;
        var dateToday = new Date();
        var logic = function( currentDateTime, input ){
            // 'this' is jquery object datetimepicker
            if(currentDateTime && currentDateTime.getDate() == dateToday.getDate()
                && currentDateTime.getMonth() == dateToday.getMonth()
                && currentDateTime.getFullYear() == dateToday.getFullYear()){
                this.setOptions({
                    minTime: 0
                });
            }else {
                this.setOptions({
                    minTime:'12:00 am'
                });
            }
        };

        me.$('[name="schedulingMode"]').change(function () {
            var $elem = $(this);
            if ($elem.val() === 'now') {
                me.$('.date-picker-control').hide();
                me.$('.date-picker').val('');
                me.$('#approveSubmit').prop('disabled', false);
                me.$('#approveSubmitVal').hide;
            } else {
                me.$('.date-picker-control').show();
                me.$('.date-picker').select();
                me.$('#approveSubmit').prop('disabled', true);
                me.$('#approveSubmitVal').show();
            }
        });

        me.$('.date-picker').datetimepicker({
            format: 'm/d/Y h:i a',
            dateFormat: "m/d/Y",
            formatTime:	'h:i a',
            minDate: '0',
            minTime: 0,
            step: 15,
            onChangeDateTime: logic
        });

        me.$('.date-picker').change(function () {
            var $elem = $(this);
            if ($elem.val() !=null && $elem.val() != "") {
                me.$('#approveSubmit').prop('disabled', false);
                me.$('#approveSubmitVal').hide();
            }else{
                me.$('#approveSubmit').prop('disabled', true);
                me.$('#approveSubmitVal').show();
            }
        });

    }

    function getScheduledDateTimeForJson(dateTimeValue) {
        var schedDate = new Date(dateTimeValue);
        var schedDateMonth = schedDate.getMonth() + 1;
        var scheduledDate = schedDate.getFullYear() + '-' + schedDateMonth + '-'
            + schedDate.getDate() + 'T' + schedDate.getHours() + ':'
            + schedDate.getMinutes() + ':' + schedDate.getSeconds();

        return scheduledDate;
    }

}) (CStudioAuthoring);