# Extending arrays with zip_with
class Array
	def zip_with *arrays, &block
		output = []
		self.count.times do |n|
			output << (yield *(arrays.map { |array| array[n] } << self[n]))
		end # each val
		return output
	end # zip_with
end # Array