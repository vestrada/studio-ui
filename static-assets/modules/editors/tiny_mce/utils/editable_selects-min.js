var TinyMCE_EditableSelects={editSelectElm:null,init:function(){var a=document.getElementsByTagName("select"),b,e=document,c;
for(b=0;
b<a.length;
b++){if(a[b].className.indexOf("mceEditableSelect")!=-1){c=new Option(tinyMCEPopup.editor.translate("value"),"__mce_add_custom__");
c.className="mceAddSelectValue";
a[b].options[a[b].options.length]=c;
a[b].onchange=TinyMCE_EditableSelects.onChangeEditableSelect
}}},onChangeEditableSelect:function(c){var f=document,b,a=window.event?window.event.srcElement:c.target;
if(a.options[a.selectedIndex].value=="__mce_add_custom__"){b=f.createElement("input");
b.id=a.id+"_custom";
b.name=a.name+"_custom";
b.type="text";
b.style.width=a.offsetWidth+"px";
a.parentNode.insertBefore(b,a);
a.style.display="none";
b.focus();
b.onblur=TinyMCE_EditableSelects.onBlurEditableSelectInput;
b.onkeydown=TinyMCE_EditableSelects.onKeyDown;
TinyMCE_EditableSelects.editSelectElm=a
}},onBlurEditableSelectInput:function(){var a=TinyMCE_EditableSelects.editSelectElm;
if(a){if(a.previousSibling.value!=""){addSelectValue(document.forms[0],a.id,a.previousSibling.value,a.previousSibling.value);
selectByValue(document.forms[0],a.id,a.previousSibling.value)
}else{selectByValue(document.forms[0],a.id,"")
}a.style.display="inline";
a.parentNode.removeChild(a.previousSibling);
TinyMCE_EditableSelects.editSelectElm=null
}},onKeyDown:function(a){a=a||window.event;
if(a.keyCode==13){TinyMCE_EditableSelects.onBlurEditableSelectInput()
}}};