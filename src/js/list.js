/*
	circular link list implementation
	ChaoHuiZheng
	2019/12/05
*/


class ListNode
{
	constructor(val)
	{
		this.val = val;
		this.next = null;
		this.previous = null;
	}
}


class List
{
	constructor()
	{
		this.head = null;
		this.tail = null;
		this.size = 0;
	}
	push_back(val)
	{
		var node = new ListNode(val);
		if(this.head == null)
		{
			this.head = node;
			this.tail = node;
			this.head.next = this.head;
			this.head.previous = this.head;
		}
		else
		{
			this.tail.next = node;
			node.next = this.head;
			this.head.previous = node;
			node.previous = this.tail;
			this.tail = node;
		}
		this.size++;
		return node;
	}
	empty()
	{
		return this.size == 0;
	}
	pop_back()
	{
		let rv = this.tail;
		if(this.size == 0) return;
		this.tail = this.tail.previous;
		this.tail.next = this.head;
		this.head.previous = this.tail;
		this.size--;
		return rv;
	}
	push_front(val)
	{
		var node;
		if(this.head == null) this.push_back(val);
		else
		{
			node = new ListNode(val);
			node.next = this.head;
			node.previous = this.tail;
			this.tail.next = this.head;
			this.head.previous = node;
			this.head = node;
			this.size++;
			return node;
		}

		
		
	}
	pop_front()
	{	
		let rv = this.head;
		if(this.size == 0) return;
		this.head = this.head.next;
		this.head.previous = this.tail;
		this.tail.next = this.head;
		this.size--;
		return rv;
	}
	insert_after(node, newVal)
	{	
		/*
		var node = this.head;
		var newNode;
		var next;
		for(var i = 0; i < this.size; i++)
		{
			if(node.val == val) break;
			node = node.next;
		}
		if(node == this.head) this.push_back(newVal);
		*/
		//else
		//{
			var newNode;
			var next;

			newNode = new ListNode(newVal);
			next = node.next;
			node.next = newNode;
			newNode.previous = node;
			newNode.next = next;
			next.previous = newNode;
			this.size++;

			if(node == this.tail) this.tail = newNode;
			
			return newNode;
		//}
	}
	erase(node)
	{	
		/*
		var node = this.head;
		var next,previous;
		for(var i = 0; i < this.size; i++)
		{
			if(node.val == val) break;
			node = node.next;
		}
		*/
		if(node == this.head) this.head = this.head.next;
		if(node == this.tail) this.tail = this.tail.previous;
		node.next.previous = node.previous;
		node.previous.next = node.next;
	}
	print()
	{
		var node = this.head;
		for(var i = 0; i < this.size; i++)
		{
			console.log(node.val);
			node = node.next;
		}
	}
}

module.exports = {
	List:List
}

/*
var list = new List();
list.push_back(1);
list.push_back(3);
list.push_back(5);
list.push_back(7);
list.push_back(9);

list.insert_after(3,4);
list.insert_after(2,4);
list.erase(3);
list.erase(7);
list.erase(4);

list.print();

*/