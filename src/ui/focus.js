/** Restore keyboard focus after a view replaces a control. @param {HTMLElement} root */
export function rememberFocus(root){
 const node=document.activeElement;if(!(node instanceof HTMLElement)||!root.contains(node))return ()=>{};
 let selector=node.id?'#'+CSS.escape(node.id):'';
 if(!selector)for(const key of ['data-lesson-action','data-learning-action','data-imitation-action','data-lab','data-stage','data-learning-stage','data-imitation-stage'])if(node.hasAttribute(key)){selector='['+key+'="'+CSS.escape(node.getAttribute(key)??'')+'"]';break;}
 let formSelector='',controlIndex=-1;
 if(!selector){const form=node.closest('form');if(form){formSelector=form.id?'#'+CSS.escape(form.id):'';if(!formSelector)for(const key of ['data-learning-form','data-learning-check','data-imitation-form','data-form','data-check'])if(form.hasAttribute(key)){formSelector='form['+key+'="'+CSS.escape(form.getAttribute(key)??'')+'"]';break;}controlIndex=[...form.elements].indexOf(node);}}
 return ()=>{
  const form=formSelector?root.querySelector(formSelector):null;
  const target=selector?root.querySelector(selector):form instanceof HTMLFormElement?form.elements.item(controlIndex):null;
  if(target instanceof HTMLElement&&target.getClientRects().length&&!target.hasAttribute('disabled'))target.focus({preventScroll:true});
  else if(selector||formSelector){const title=root.querySelector('h2[tabindex="-1"]');if(title instanceof HTMLElement)title.focus({preventScroll:true});}
 };
}
