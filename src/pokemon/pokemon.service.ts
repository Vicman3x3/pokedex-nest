import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch(err){
      if(err.code === 11000){
        throw new BadRequestException(`El Puchamon ${JSON.stringify(err.keyValue)} ya existe en base de datos`)
      }
      console.log(err);
      throw new InternalServerErrorException(`No se puede crear el Pokemon - revisar los logs`)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(termino: string) {

    let pokemon: Pokemon;

    if(!isNaN(+termino)){
      pokemon = await this.pokemonModel.findOne({no:termino});
    }

    if(!pokemon && isValidObjectId(termino)){
      pokemon = await this.pokemonModel.findById(termino)
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:termino.toLowerCase().trim()});
    }

    if(!pokemon) throw new NotFoundException(`El Pokemon ${termino} no ha sido encontrado`)


    return pokemon;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
