// *** Component helpers

/**
 * Recursive gets sibling, until gets real tag, not "<!-- --->".
 * Some angular directives love to use meta-comments.
 */
export function getNonCommentSibling<T extends ChildNode = ChildNode>(
    element: Node,
    direction: 'next' | 'prev'
): T | null {
    const sibling = (direction === 'prev')
        ? element.previousSibling as T
        : element.nextSibling as T;

    if (!sibling || !/comment/.test(sibling.nodeName)) {
        return sibling;
    }

    return getNonCommentSibling<T>(sibling, direction);
}
