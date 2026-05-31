import { visit } from "unist-util-visit";

function escapeHtml(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function splitHighlightText(value) {
	const nodes = [];
	let cursor = 0;

	while (cursor < value.length) {
		const start = value.indexOf("==", cursor);
		if (start === -1) {
			nodes.push({ type: "text", value: value.slice(cursor) });
			break;
		}

		const end = value.indexOf("==", start + 2);
		if (end === -1) {
			nodes.push({ type: "text", value: value.slice(cursor) });
			break;
		}

		if (start > cursor) {
			nodes.push({ type: "text", value: value.slice(cursor, start) });
		}

		const highlighted = value.slice(start + 2, end);
		if (highlighted.length > 0) {
			nodes.push({
				type: "html",
				value: `<mark>${escapeHtml(highlighted)}</mark>`,
			});
		}

		cursor = end + 2;
	}

	return nodes.filter((node) => node.value !== "");
}

export function remarkHighlight() {
	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			if (
				!parent ||
				typeof index !== "number" ||
				!node.value.includes("==")
			) {
				return;
			}

			const nodes = splitHighlightText(node.value);
			if (nodes.length === 0) {
				return;
			}

			parent.children.splice(index, 1, ...nodes);
			return index + nodes.length;
		});
	};
}
