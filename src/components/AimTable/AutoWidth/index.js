import {minWidthTableColumn} from "@/components/cells/types";

export const AimTableAutoWidthClass = 'aim-table-auto-width'

export function forceAdjustColumnWidth(tableEL, bindingValue) {
    // doLayout后刷新一次宽度，解决fixed right导致的错乱问题,但是导致了当inplace编辑时填写数据后组件刷新，正在编辑的数据跳出视野
    // 注意这里不要主动更新table的组件属性，属性更新会导致componentUpdated，继而更新属性，循环调用
    bindingValue.doLayout(() => {
        const padding = bindingValue.padding || 60
        const colgroup = tableEL.querySelector("colgroup");
        const colDefs = [...colgroup.querySelectorAll("col")];
        colDefs.forEach((col) => {
            const clsName = col.getAttribute("name");
            const cells = [
                ...tableEL.querySelectorAll(`td.${clsName}`),
                ...tableEL.querySelectorAll(`th.${clsName}`),
            ];
            if (cells[0] && cells[0].classList && cells[0].classList.contains("aim-column-fixed-width")) {
                return;
            }
            const widthList = cells.map((el) => {
                const cell = el.querySelector(".cell");
                if(cell && cell.scrollWidth){
                    return cell.scrollWidth
                }
                return 0
            });
            const max = Math.max(...widthList);
            tableEL.querySelectorAll(`col[name=${clsName}]`).forEach((el) => {
                el.setAttribute("width", `${max + padding}px`);
                console.log("set width ",el,max,el.getAttribute("width"))
            });
        });
    })
}

const jsb = require("@sandwich-go/jsb")
export function flexColumnWidth(schema,tableData) {
    jsb.each(schema,(fieldSchema)=>{
        if(fieldSchema.width || fieldSchema.min_width){
            return
        }
        let headerExtraWidth = 0
        if(fieldSchema.required){
            headerExtraWidth = headerExtraWidth + 40
        }
        if(fieldSchema.sortable){
            headerExtraWidth = headerExtraWidth + 40
        }
        if(fieldSchema.lock){
            headerExtraWidth = headerExtraWidth + 40
        }
        if(fieldSchema.tips){
            headerExtraWidth = headerExtraWidth + 40
        }
        const headerWidth =  jsb.textWidth(fieldSchema.name) + headerExtraWidth
        const minWidth = minWidthTableColumn(fieldSchema.type)
        const arr = tableData.map(x => x[fieldSchema.field])
        let width = jsb.longestTextWidth(arr)
        if(width < minWidth){
            width = minWidth
        }
        if(width < headerWidth) {
            width = headerWidth
        }
        fieldSchema.width = width
        console.log("flexColumnWidth ",fieldSchema,)
    })
}